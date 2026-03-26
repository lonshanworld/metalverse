package routes

import (
	"medalverse-be/internal/config"
	"medalverse-be/internal/handlers"
	"medalverse-be/internal/services"
	"medalverse-be/internal/storage"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config, storage storage.Storage) {

	healthHandler := handlers.NewHealthHandler()
	router.GET("/health", healthHandler.Health)

	readyzHandler := handlers.NewReadyzHandler(db, storage)
	router.GET("/readyz", readyzHandler.Readyz)

	v1 := router.Group("/api/v1")
	{
		emailService := services.NewSESEmailService(cfg)
		authHandler := handlers.NewAuthHandler(db, cfg, emailService)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/verify-email", authHandler.VerifyEmail)
			auth.GET("/google", authHandler.GoogleLogin)
			auth.GET("/google/callback", authHandler.GoogleCallback)
		}

		protected := v1.Group("")
		// protected.Use(middleware.AuthMiddleware(cfg)) // BYPASSED FOR NOW
		{
			protected.GET("/profile", authHandler.GetProfile)

			// Files
			fileHandler := handlers.NewFileHandler(db, storage)
			files := protected.Group("/files")
			{
				files.POST("/upload", fileHandler.Upload)
				files.GET("", fileHandler.List)
				files.GET("/:id/presigned-url", fileHandler.GetPresignedURL)
				files.DELETE("/:id", fileHandler.Delete)
			}

			setupUserRoutes(v1, protected, db)
			setupEventRoutes(protected, db)
			setupOrganizationRoutes(protected, db)
			setupMedalVerseCodeRoutes(protected, db)
			setupCredentialRoutes(protected, db)
		}
	}
}
