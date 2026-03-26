package database

import (
	"fmt"
	"log"
	"os"
	"strings"

	"medalverse-be/internal/config"
	"medalverse-be/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// useSimpleProtocol returns true when the DSN targets Supabase's transaction pooler (PgBouncer).
// Prepared statements do not work reliably there; GORM must use the simple query protocol.
func useSimpleProtocol(dsn string) bool {
	if strings.EqualFold(strings.TrimSpace(os.Getenv("DATABASE_USE_SIMPLE_PROTOCOL")), "true") {
		return true
	}
	if strings.EqualFold(strings.TrimSpace(os.Getenv("SUPABASE_POOLER")), "true") {
		return true
	}
	lower := strings.ToLower(dsn)
	return strings.Contains(lower, "pooler.supabase.com") || strings.Contains(lower, "pooler.supabase.co")
}

type Database struct {
	DB *gorm.DB
}

func New(cfg *config.Config) (*Database, error) {
	dsn := cfg.GetDSN()

	var dialector gorm.Dialector
	if useSimpleProtocol(dsn) {
		log.Println("Postgres: using simple query protocol (Supabase pooler / DATABASE_USE_SIMPLE_PROTOCOL)")
		dialector = postgres.New(postgres.Config{
			DSN:                  dsn,
			PreferSimpleProtocol: true,
		})
	} else {
		dialector = postgres.Open(dsn)
	}

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Info),
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")

	return &Database{DB: db}, nil
}

func (d *Database) AutoMigrate() error {
	log.Println("Running auto migrations...")

	err := d.DB.AutoMigrate(
		// Core
		&models.User{},
		&models.File{},
		&models.Organization{},
		&models.OrganizationMember{},
		&models.OrganizationOnboardingSubmission{},
		&models.Location{},

		// Master Data
		&models.EventType{},
		&models.Field{},
		&models.ParticipationMode{},
		&models.CompetitionLevel{},
		&models.EligibilityGroup{},

		// Events
		&models.Event{},
		&models.EventFile{},
		&models.Tag{},
		&models.EventTag{},
		&models.EventEligibility{},
		&models.Outcome{},
		&models.EventOutcome{},
		&models.EventAgendaItem{},
		&models.Speaker{},
		&models.EventSpeaker{},

		// User Actions
		&models.EventBookmark{},
		&models.EventTicketType{},
		&models.EventRegistration{},
		&models.EventView{},

		// Credentials
		&models.MedalVerseCode{},
		&models.Credential{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
