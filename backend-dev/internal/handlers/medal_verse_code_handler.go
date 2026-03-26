package handlers

import (
	"net/http"

	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MedalVerseCodeHandler struct {
	svc services.MedalVerseCodeService
}

func NewMedalVerseCodeHandler(svc services.MedalVerseCodeService) *MedalVerseCodeHandler {
	return &MedalVerseCodeHandler{svc: svc}
}

func (h *MedalVerseCodeHandler) List(c *gin.Context) {
	codes, err := h.svc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, codes)
}

func (h *MedalVerseCodeHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	code, err := h.svc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "medal verse code not found"})
		return
	}
	c.JSON(http.StatusOK, code)
}


func (h *MedalVerseCodeHandler) Create(c *gin.Context) {
	var req services.CreateMedalVerseCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	code, err := h.svc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, code)
}


func (h *MedalVerseCodeHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req services.UpdateMedalVerseCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	code, err := h.svc.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, code)
}


func (h *MedalVerseCodeHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.svc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "medal verse code deleted successfully"})
}
