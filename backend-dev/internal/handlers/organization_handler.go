package handlers

import (
	"net/http"
	"strings"

	"medalverse-be/internal/middleware"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrganizationHandler struct {
	svc services.OrganizationService
}

func NewOrganizationHandler(svc services.OrganizationService) *OrganizationHandler {
	return &OrganizationHandler{svc: svc}
}


func (h *OrganizationHandler) List(c *gin.Context) {
	orgs, err := h.svc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, orgs)
}


func (h *OrganizationHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	org, err := h.svc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
		return
	}
	c.JSON(http.StatusOK, org)
}


func (h *OrganizationHandler) Create(c *gin.Context) {
	var req services.CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org, err := h.svc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, org)
}

func (h *OrganizationHandler) SubmitOnboarding(c *gin.Context) {
	var req services.SubmitOrganizationOnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !req.AgreedToTerms {
		c.JSON(http.StatusBadRequest, gin.H{"error": "terms must be accepted"})
		return
	}

	if userID, ok := middleware.GetUserID(c); ok {
		req.CreatedByUserID = &userID
	}

	submission, err := h.svc.SubmitOnboarding(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    submission,
	})
}

func (h *OrganizationHandler) GetLatestOnboardingSubmission(c *gin.Context) {
	email := strings.TrimSpace(c.Query("email"))
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email query is required"})
		return
	}

	submission, err := h.svc.GetLatestOnboardingSubmissionByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "onboarding submission not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": submission})
}


func (h *OrganizationHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	var req services.UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org, err := h.svc.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, org)
}


func (h *OrganizationHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid organization id"})
		return
	}

	if err := h.svc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "organization deleted successfully"})
}
