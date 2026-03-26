package routes

import (
	"medalverse-be/internal/handlers"
	"medalverse-be/internal/repositories"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupCredentialRoutes(protected *gin.RouterGroup, db *gorm.DB) {
	repo := repositories.NewCredentialRepository(db)
	svc := services.NewCredentialService(repo)
	h := handlers.NewCredentialHandler(svc)

	credentials := protected.Group("/credentials")
	{
		credentials.GET("", h.List)
		credentials.GET("/:id", h.Get)
		credentials.POST("", h.Create)
		credentials.PUT("/:id", h.Update)
		credentials.DELETE("/:id", h.Delete)
	}
}
