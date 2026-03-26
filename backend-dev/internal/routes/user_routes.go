package routes

import (
	"medalverse-be/internal/handlers"
	"medalverse-be/internal/repositories"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupUserRoutes(public *gin.RouterGroup, protected *gin.RouterGroup, db *gorm.DB) {
	repo := repositories.NewUserRepository(db)
	svc := services.NewUserService(repo)
	h := handlers.NewUserHandler(svc)

	publicUsers := public.Group("/users")
	{
		publicUsers.GET("/email", h.GetByEmail)
	}

	protectedUsers := protected.Group("/users")
	{
		protectedUsers.GET("", h.List)
		protectedUsers.GET("/:id", h.Get)
		protectedUsers.PUT("/:id", h.Update)
		protectedUsers.DELETE("/:id", h.Delete)
	}
}
