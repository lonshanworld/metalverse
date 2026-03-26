package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"medalverse-be/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioStorage struct {
	client     *minio.Client
	bucketName string
	endpoint   string
	useSSL     bool
}

func NewMinioStorage(cfg *config.StorageConfig) (*MinioStorage, error) {
	client, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	storage := &MinioStorage{
		client:     client,
		bucketName: cfg.MinioBucket,
		endpoint:   cfg.MinioEndpoint,
		useSSL:     cfg.MinioUseSSL,
	}

	if err := storage.ensureBucket(context.Background()); err != nil {
		return nil, err
	}

	log.Printf("MinIO storage initialized with bucket: %s", cfg.MinioBucket)
	return storage, nil
}

func (s *MinioStorage) ensureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}
		log.Printf("Created bucket: %s", s.bucketName)
	}

	return nil
}

func (s *MinioStorage) Upload(ctx context.Context, key string, reader io.Reader, contentType string, size int64) (string, error) {
	_, err := s.client.PutObject(ctx, s.bucketName, key, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	return s.GetURL(ctx, key)
}

func (s *MinioStorage) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	object, err := s.client.GetObject(ctx, s.bucketName, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to download file: %w", err)
	}
	return object, nil
}

func (s *MinioStorage) Delete(ctx context.Context, key string) error {
	err := s.client.RemoveObject(ctx, s.bucketName, key, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

func (s *MinioStorage) GetURL(ctx context.Context, key string) (string, error) {
	protocol := "http"
	if s.useSSL {
		protocol = "https"
	}
	return fmt.Sprintf("%s://%s/%s/%s", protocol, s.endpoint, s.bucketName, key), nil
}

func (s *MinioStorage) GetPresignedURL(ctx context.Context, key string, expiryMinutes int) (string, error) {
	expiry := time.Duration(expiryMinutes) * time.Minute
	url, err := s.client.PresignedGetObject(ctx, s.bucketName, key, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}
	return url.String(), nil
}

func (s *MinioStorage) ListFiles(ctx context.Context, prefix string) ([]string, error) {
	var files []string

	objectCh := s.client.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})

	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("error listing files: %w", object.Err)
		}
		files = append(files, object.Key)
	}

	return files, nil
}


func (s *MinioStorage) HealthCheck(ctx context.Context) error {
	
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		return fmt.Errorf("bucket %s does not exist", s.bucketName)
	}

	return nil
}
