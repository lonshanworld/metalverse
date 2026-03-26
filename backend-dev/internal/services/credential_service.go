package services

import (
	"medalverse-be/internal/models"
	"medalverse-be/internal/repositories"

	"github.com/google/uuid"
)

type CredentialService interface {
	GetAll() ([]models.Credential, error)
	GetPaginated(page, pageSize int) (*PaginatedCredentials, error)
	GetByID(id uuid.UUID) (*models.Credential, error)
	GetByUserID(userID uuid.UUID) ([]models.Credential, error)
	GetByEventID(eventID uuid.UUID) ([]models.Credential, error)
	Create(req CreateCredentialRequest) (*models.Credential, error)
	Update(id uuid.UUID, req UpdateCredentialRequest) (*models.Credential, error)
	Delete(id uuid.UUID) error
}

type CreateCredentialRequest struct {
	EventID        uuid.UUID             `json:"event_id" binding:"required"`
	UserID         uuid.UUID             `json:"user_id" binding:"required"`
	RegistrationID *uuid.UUID            `json:"registration_id"`
	Name           string                `json:"name"`
	Type           models.CredentialType `json:"type"`
	RecipientName  string                `json:"recipient_name"`
	FieldID        *uuid.UUID            `json:"field_id"`
	Rank           string                `json:"rank"`
	KeyLearning    string                `json:"key_learning"`
	IsPrivate      bool                  `json:"is_private"`
}

type UpdateCredentialRequest struct {
	Name          string                `json:"name"`
	Type          models.CredentialType `json:"type"`
	RecipientName string                `json:"recipient_name"`
	FieldID       *uuid.UUID            `json:"field_id"`
	Rank          string                `json:"rank"`
	KeyLearning   string                `json:"key_learning"`
	IsPrivate     *bool                 `json:"is_private"`
}

type credentialService struct {
	repo repositories.CredentialRepository
}

type PaginatedCredentials struct {
	Data       []models.Credential `json:"data"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	PageSize   int                 `json:"page_size"`
	TotalPages int64               `json:"total_pages"`
}

func NewCredentialService(repo repositories.CredentialRepository) CredentialService {
	return &credentialService{repo: repo}
}

func (s *credentialService) GetAll() ([]models.Credential, error) {
	return s.repo.GetAll()
}

func (s *credentialService) GetPaginated(page, pageSize int) (*PaginatedCredentials, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	data, total, err := s.repo.GetAllPaginated(page, pageSize)
	if err != nil {
		return nil, err
	}

	totalPages := total / int64(pageSize)
	if total%int64(pageSize) != 0 {
		totalPages++
	}

	return &PaginatedCredentials{
		Data:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *credentialService) GetByID(id uuid.UUID) (*models.Credential, error) {
	return s.repo.GetByID(id)
}

func (s *credentialService) GetByUserID(userID uuid.UUID) ([]models.Credential, error) {
	return s.repo.GetByUserID(userID)
}

func (s *credentialService) GetByEventID(eventID uuid.UUID) ([]models.Credential, error) {
	return s.repo.GetByEventID(eventID)
}

func (s *credentialService) Create(req CreateCredentialRequest) (*models.Credential, error) {
	credential := &models.Credential{
		EventID:        req.EventID,
		UserID:         req.UserID,
		RegistrationID: req.RegistrationID,
		Name:           req.Name,
		Type:           req.Type,
		RecipientName:  req.RecipientName,
		FieldID:        req.FieldID,
		Rank:           req.Rank,
		KeyLearning:    req.KeyLearning,
		IsPrivate:      req.IsPrivate,
	}
	if err := s.repo.Create(credential); err != nil {
		return nil, err
	}
	return credential, nil
}

func (s *credentialService) Update(id uuid.UUID, req UpdateCredentialRequest) (*models.Credential, error) {
	credential, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		credential.Name = req.Name
	}
	if req.Type != "" {
		credential.Type = req.Type
	}
	if req.RecipientName != "" {
		credential.RecipientName = req.RecipientName
	}
	if req.FieldID != nil {
		credential.FieldID = req.FieldID
	}
	if req.Rank != "" {
		credential.Rank = req.Rank
	}
	if req.KeyLearning != "" {
		credential.KeyLearning = req.KeyLearning
	}
	if req.IsPrivate != nil {
		credential.IsPrivate = *req.IsPrivate
	}

	if err := s.repo.Update(credential); err != nil {
		return nil, err
	}
	return credential, nil
}

func (s *credentialService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
