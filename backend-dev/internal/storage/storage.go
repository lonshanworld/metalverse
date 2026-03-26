package storage

import (
	"context"
	"io"
)

type Storage interface {

	Upload(ctx context.Context, key string, reader io.Reader, contentType string, size int64) (string, error)


	Download(ctx context.Context, key string) (io.ReadCloser, error)


	Delete(ctx context.Context, key string) error


	GetURL(ctx context.Context, key string) (string, error)


	GetPresignedURL(ctx context.Context, key string, expiryMinutes int) (string, error)


	ListFiles(ctx context.Context, prefix string) ([]string, error)


	HealthCheck(ctx context.Context) error
}
