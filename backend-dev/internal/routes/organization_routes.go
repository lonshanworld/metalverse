package routes

import (
	"medalverse-be/internal/handlers"
	"medalverse-be/internal/repositories"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupOrganizationRoutes(protected *gin.RouterGroup, db *gorm.DB) {
	repo := repositories.NewOrganizationRepository(db)
	userRepo := repositories.NewUserRepository(db)
	svc := services.NewOrganizationService(repo, userRepo)
	h := handlers.NewOrganizationHandler(svc)

	orgs := protected.Group("/organizations")
	{
		orgs.GET("", h.List)
		orgs.GET("/onboarding-submissions/latest", h.GetLatestOnboardingSubmission)
		orgs.GET("/:id", h.Get)
		orgs.POST("", h.Create)
		orgs.POST("/onboarding-submissions", h.SubmitOnboarding)
		orgs.PUT("/:id", h.Update)
		orgs.DELETE("/:id", h.Delete)
	}
}
