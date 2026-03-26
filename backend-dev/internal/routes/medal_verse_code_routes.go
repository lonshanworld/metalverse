package routes

import (
	"medalverse-be/internal/handlers"
	"medalverse-be/internal/repositories"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupMedalVerseCodeRoutes(protected *gin.RouterGroup, db *gorm.DB) {
	repo := repositories.NewMedalVerseCodeRepository(db)
	svc := services.NewMedalVerseCodeService(repo)
	h := handlers.NewMedalVerseCodeHandler(svc)

	codes := protected.Group("/medal-verse-codes")
	{
		codes.GET("", h.List)
		codes.GET("/:id", h.Get)
		codes.POST("", h.Create)
		codes.PUT("/:id", h.Update)
		codes.DELETE("/:id", h.Delete)
	}
}
