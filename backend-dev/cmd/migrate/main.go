package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
	"medalverse-be/internal/config"
)

const migrationsDir = "internal/database/migrations"

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	command := "up"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}

	db := connect(cfg)
	defer db.Close()

	ensureMigrationsTable(db)

	switch command {
	case "up":
		migrateUp(db)
	case "down":
		migrateDown(db)
	case "status":
		migrateStatus(db)
	default:
		log.Fatalf("Unknown command: %s (use: up | down | status)", command)
	}
}

func connect(cfg *config.Config) *sql.DB {
	dsn := cfg.GetDSN()

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v\n(host=%s port=%s dbname=%s user=%s)",
			err,
			cfg.Database.Host,
			cfg.Database.Port,
			cfg.Database.DBName,
			cfg.Database.User,
		)
	}

	log.Printf("Connected to database (host=%s dbname=%s)", cfg.Database.Host, cfg.Database.DBName)
	return db
}

func ensureMigrationsTable(db *sql.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version    BIGINT PRIMARY KEY,
			name       TEXT NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`)
	if err != nil {
		log.Fatalf("Failed to create schema_migrations table: %v", err)
	}
}

func migrateUp(db *sql.DB) {
	files := loadMigrationFiles("up")
	applied := appliedVersions(db)

	pending := 0
	for _, f := range files {
		if applied[f.version] {
			log.Printf("  skip  %06d_%s (already applied)", f.version, f.name)
			continue
		}

		log.Printf("Applying %06d_%s ...", f.version, f.name)

		content, err := os.ReadFile(f.path)
		if err != nil {
			log.Fatalf("Failed to read %s: %v", f.path, err)
		}

		tx, err := db.Begin()
		if err != nil {
			log.Fatalf("Failed to begin transaction: %v", err)
		}

		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback()
			log.Fatalf("Failed to apply migration %06d: %v", f.version, err)
		}

		if _, err := tx.Exec(
			`INSERT INTO schema_migrations (version, name) VALUES ($1, $2)`,
			f.version, f.name,
		); err != nil {
			tx.Rollback()
			log.Fatalf("Failed to record migration %06d: %v", f.version, err)
		}

		if err := tx.Commit(); err != nil {
			log.Fatalf("Failed to commit migration %06d: %v", f.version, err)
		}

		log.Printf("Applied  %06d_%s", f.version, f.name)
		pending++
	}

	if pending == 0 {
		log.Println("No pending migrations — database is up to date")
	} else {
		log.Printf("Applied %d migration(s) successfully", pending)
	}
}

func migrateDown(db *sql.DB) {
	last := lastApplied(db)
	if last == nil {
		log.Println("No migrations to roll back")
		return
	}

	downFile := filepath.Join(migrationsDir, fmt.Sprintf("%06d_%s.down.sql", last.version, last.name))
	content, err := os.ReadFile(downFile)
	if err != nil {
		log.Fatalf("Down migration file not found: %s", downFile)
	}

	log.Printf("Rolling back %06d_%s ...", last.version, last.name)

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Failed to begin transaction: %v", err)
	}

	if _, err := tx.Exec(string(content)); err != nil {
		tx.Rollback()
		log.Fatalf("Failed to roll back migration %06d: %v", last.version, err)
	}

	if _, err := tx.Exec(`DELETE FROM schema_migrations WHERE version = $1`, last.version); err != nil {
		tx.Rollback()
		log.Fatalf("Failed to remove migration record: %v", err)
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Failed to commit rollback: %v", err)
	}

	log.Printf("Rolled back %06d_%s", last.version, last.name)
}

func migrateStatus(db *sql.DB) {
	files := loadMigrationFiles("up")
	applied := appliedVersions(db)

	fmt.Println("Migration Status:")
	fmt.Println(strings.Repeat("-", 60))
	for _, f := range files {
		status := "pending"
		if applied[f.version] {
			status = "applied"
		}
		fmt.Printf("  [%-7s] %06d_%s\n", status, f.version, f.name)
	}
}

type migrationFile struct {
	version int64
	name    string
	path    string
}

func loadMigrationFiles(direction string) []migrationFile {
	pattern := filepath.Join(migrationsDir, fmt.Sprintf("*.%s.sql", direction))
	matches, err := filepath.Glob(pattern)
	if err != nil {
		log.Fatalf("Failed to glob migration files: %v", err)
	}

	var files []migrationFile
	for _, p := range matches {
		base := filepath.Base(p)
		parts := strings.SplitN(base, "_", 2)
		if len(parts) < 2 {
			continue
		}
		version, err := strconv.ParseInt(parts[0], 10, 64)
		if err != nil {
			continue
		}
		name := strings.TrimSuffix(parts[1], "."+direction+".sql")
		files = append(files, migrationFile{version: version, name: name, path: p})
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].version < files[j].version
	})
	return files
}

func appliedVersions(db *sql.DB) map[int64]bool {
	rows, err := db.Query(`SELECT version FROM schema_migrations`)
	if err != nil {
		log.Fatalf("Failed to query schema_migrations: %v", err)
	}
	defer rows.Close()

	applied := make(map[int64]bool)
	for rows.Next() {
		var v int64
		rows.Scan(&v)
		applied[v] = true
	}
	return applied
}

func lastApplied(db *sql.DB) *migrationFile {
	var version int64
	var name string
	err := db.QueryRow(`
		SELECT version, name FROM schema_migrations ORDER BY version DESC LIMIT 1
	`).Scan(&version, &name)
	if err != nil {
		return nil
	}
	return &migrationFile{version: version, name: name}
}
