package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"medalverse-be/internal/middleware"
	"medalverse-be/internal/models"
	"medalverse-be/internal/storage"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileHandler struct {
	db      *gorm.DB
	storage storage.Storage
}

func NewFileHandler(db *gorm.DB, storage storage.Storage) *FileHandler {
	return &FileHandler{
		db:      db,
		storage: storage,
	}
}

func (h *FileHandler) Upload(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	ext := filepath.Ext(file.Filename)

	storageKey := fmt.Sprintf(
		"uploads/%s/%s%s",
		userID.String(),
		uuid.New().String(),
		ext,
	)

	url, err := h.storage.Upload(c.Request.Context(), storageKey, src, file.Header.Get("Content-Type"), file.Size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}

	fileModel := models.File{
		OwnerUserID: &userID,
		FileName:    file.Filename,
		FileSize:    file.Size,
		MimeType:    file.Header.Get("Content-Type"),
		StorageKey:  storageKey,
		URL:         url,
	}

	if err := h.db.Create(&fileModel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file metadata"})
		return
	}

	c.JSON(http.StatusCreated, fileModel)
}

func (h *FileHandler) List(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var files []models.File
	if err := h.db.Preload("Owner").Where("owner_user_id = ?", userID).Find(&files).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve files"})
		return
	}

	c.JSON(http.StatusOK, files)
}

func (h *FileHandler) GetPresignedURL(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	fileID := c.Param("id")
	var file models.File
	if err := h.db.Preload("Owner").Where("file_id = ? AND owner_user_id = ?", fileID, userID).First(&file).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	url, err := h.storage.GetPresignedURL(c.Request.Context(), file.StorageKey, 60)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":        url,
		"expires_at": time.Now().Add(60 * time.Minute),
	})
}

func (h *FileHandler) Delete(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	fileID := c.Param("id")
	var file models.File
	if err := h.db.Preload("Owner").Where("file_id = ? AND owner_user_id = ?", fileID, userID).First(&file).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	if err := h.storage.Delete(c.Request.Context(), file.StorageKey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file from storage"})
		return
	}

	if err := h.db.Delete(&file).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file metadata"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}
