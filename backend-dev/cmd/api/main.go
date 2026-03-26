package main

import (
	"log"
	"strings"

	"medalverse-be/internal/config"
	"medalverse-be/internal/database"
	"medalverse-be/internal/middleware"
	"medalverse-be/internal/routes"
	"medalverse-be/internal/storage"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	gin.SetMode(cfg.Server.GinMode)

	db, err := database.New(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if cfg.Environment == "development" {
		if err := db.AutoMigrate(); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}

		if err := db.SeedIfEmpty(); err != nil {
			log.Fatalf("Failed to seed database: %v", err)
		}
	}

	storageService, err := storage.NewStorage(&cfg.Storage)
	if err != nil {
		log.Printf("WARNING: Failed to initialize storage (file upload unavailable): %v", err)
		storageService = nil
	}

	router := gin.Default()
	if err := router.SetTrustedProxies(cfg.Server.TrustedProxies); err != nil {
		log.Fatalf("Failed to set trusted proxies: %v", err)
	}

	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))

	routes.SetupRoutes(router, db.DB, cfg, storageService)

	addr := ":" + cfg.Server.Port
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		if strings.Contains(err.Error(), "address already in use") || strings.Contains(err.Error(), "Only one usage of each socket address") {
			log.Fatalf("Port %s is already in use. Stop the current process or change SERVER_PORT in your environment.", cfg.Server.Port)
		}
		log.Fatalf("Failed to start server: %v", err)
	}
}
