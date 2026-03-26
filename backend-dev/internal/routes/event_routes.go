package routes

import (
	"medalverse-be/internal/handlers"
	"medalverse-be/internal/repositories"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupEventRoutes(protected *gin.RouterGroup, db *gorm.DB) {
	repo := repositories.NewEventRepository(db)
	svc := services.NewEventService(repo, db)
	h := handlers.NewEventHandler(svc)

	events := protected.Group("/events")
	{
		events.GET("", h.List)
		events.GET("/:id", h.Get)
		events.POST("", h.Create)
		events.PUT("/:id", h.Update)
		events.DELETE("/:id", h.Delete)
	}
}
