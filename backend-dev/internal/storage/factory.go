package storage

import (
	"fmt"

	"medalverse-be/internal/config"
)

// NewStorage creates a new storage instance based on the provider
func NewStorage(cfg *config.StorageConfig) (Storage, error) {
	switch cfg.Provider {
	case "minio":
		return NewMinioStorage(cfg)
	case "aws":
		return nil, fmt.Errorf("AWS S3 storage not yet implemented")
	case "gcp":
		return nil, fmt.Errorf("GCP storage not yet implemented")
	case "azure":
		return nil, fmt.Errorf("Azure storage not yet implemented")
	default:
		return nil, fmt.Errorf("unsupported storage provider: %s", cfg.Provider)
	}
}
