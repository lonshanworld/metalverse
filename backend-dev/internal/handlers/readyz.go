package handlers

import (
	"context"
	"net/http"
	"time"

	"medalverse-be/internal/storage"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReadyzHandler struct {
	db      *gorm.DB
	storage storage.Storage
}

func NewReadyzHandler(db *gorm.DB, storage storage.Storage) *ReadyzHandler {
	return &ReadyzHandler{
		db:      db,
		storage: storage,
	}
}

func (h *ReadyzHandler) Readyz(c *gin.Context) {
	checks := make(map[string]interface{})
	allHealthy := true

	dbStatus := h.checkDatabase()
	checks["database"] = dbStatus
	if dbStatus["status"] != "healthy" {
		allHealthy = false
	}

	storageStatus := h.checkStorage()
	checks["storage"] = storageStatus
	if storageStatus["status"] != "healthy" {
		allHealthy = false
	}

	if allHealthy {
		c.JSON(http.StatusOK, gin.H{
			"status": "ready",
			"checks": checks,
		})
	} else {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "not ready",
			"checks": checks,
		})
	}
}

// checkDatabase verifies database connectivity
func (h *ReadyzHandler) checkDatabase() map[string]interface{} {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	sqlDB, err := h.db.DB()
	if err != nil {
		return map[string]interface{}{
			"status":  "unhealthy",
			"message": "failed to get database instance",
			"error":   err.Error(),
		}
	}

	if err := sqlDB.PingContext(ctx); err != nil {
		return map[string]interface{}{
			"status":  "unhealthy",
			"message": "database ping failed",
			"error":   err.Error(),
		}
	}

	return map[string]interface{}{
		"status":  "healthy",
		"message": "database connection is active",
	}
}

// checkStorage verifies storage connectivity
func (h *ReadyzHandler) checkStorage() map[string]interface{} {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Use the HealthCheck method from the storage interface
	if err := h.storage.HealthCheck(ctx); err != nil {
		return map[string]interface{}{
			"status":  "unhealthy",
			"message": "storage health check failed",
			"error":   err.Error(),
		}
	}

	return map[string]interface{}{
		"status":  "healthy",
		"message": "storage is accessible",
	}
}
