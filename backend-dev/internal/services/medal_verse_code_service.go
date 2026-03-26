package services

import (
	"time"

	"medalverse-be/internal/models"
	"medalverse-be/internal/repositories"

	"github.com/google/uuid"
)

type MedalVerseCodeService interface {
	GetAll() ([]models.MedalVerseCode, error)
	GetByID(id uuid.UUID) (*models.MedalVerseCode, error)
	GetByCode(code string) (*models.MedalVerseCode, error)
	GetByEventID(eventID uuid.UUID) ([]models.MedalVerseCode, error)
	Create(req CreateMedalVerseCodeRequest) (*models.MedalVerseCode, error)
	Update(id uuid.UUID, req UpdateMedalVerseCodeRequest) (*models.MedalVerseCode, error)
	Delete(id uuid.UUID) error
}

type CreateMedalVerseCodeRequest struct {
	Code      string     `json:"code" binding:"required"`
	EventID   uuid.UUID  `json:"event_id" binding:"required"`
	MaxUses   int        `json:"max_uses"`
	ExpiresAt *time.Time `json:"expires_at"`
}

type UpdateMedalVerseCodeRequest struct {
	Code      string     `json:"code"`
	MaxUses   *int       `json:"max_uses"`
	ExpiresAt *time.Time `json:"expires_at"`
	IsActive  *bool      `json:"is_active"`
}

type medalVerseCodeService struct {
	repo repositories.MedalVerseCodeRepository
}

func NewMedalVerseCodeService(repo repositories.MedalVerseCodeRepository) MedalVerseCodeService {
	return &medalVerseCodeService{repo: repo}
}

func (s *medalVerseCodeService) GetAll() ([]models.MedalVerseCode, error) {
	return s.repo.GetAll()
}

func (s *medalVerseCodeService) GetByID(id uuid.UUID) (*models.MedalVerseCode, error) {
	return s.repo.GetByID(id)
}

func (s *medalVerseCodeService) GetByCode(code string) (*models.MedalVerseCode, error) {
	return s.repo.GetByCode(code)
}

func (s *medalVerseCodeService) GetByEventID(eventID uuid.UUID) ([]models.MedalVerseCode, error) {
	return s.repo.GetByEventID(eventID)
}

func (s *medalVerseCodeService) Create(req CreateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
	code := &models.MedalVerseCode{
		Code:      req.Code,
		EventID:   req.EventID,
		MaxUses:   req.MaxUses,
		ExpiresAt: req.ExpiresAt,
		IsActive:  true,
	}
	if err := s.repo.Create(code); err != nil {
		return nil, err
	}
	return code, nil
}

func (s *medalVerseCodeService) Update(id uuid.UUID, req UpdateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
	code, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Code != "" {
		code.Code = req.Code
	}
	if req.MaxUses != nil {
		code.MaxUses = *req.MaxUses
	}
	if req.ExpiresAt != nil {
		code.ExpiresAt = req.ExpiresAt
	}
	if req.IsActive != nil {
		code.IsActive = *req.IsActive
	}

	if err := s.repo.Update(code); err != nil {
		return nil, err
	}
	return code, nil
}

func (s *medalVerseCodeService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
