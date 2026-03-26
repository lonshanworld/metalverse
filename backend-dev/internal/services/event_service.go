package services

import (
	"time"

	"medalverse-be/internal/models"
	"medalverse-be/internal/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventService interface {
	GetAll(page, pageSize int, createdBy *uuid.UUID) (*PaginatedEvents, error)
	GetByID(id uuid.UUID) (*models.Event, error)
	GetByOrgID(orgID uuid.UUID) ([]models.Event, error)
	Create(req CreateEventRequest) (*models.Event, error)
	Update(id uuid.UUID, req UpdateEventRequest) (*models.Event, error)
	Delete(id uuid.UUID) error
}

type CreateEventRequest struct {
	OrgID                *uuid.UUID `json:"org_id"`
	LocationID           *uuid.UUID `json:"location_id"`
	Name                 string     `json:"name" binding:"required"`
	ShortDescription     string     `json:"short_description"`
	Description          string     `json:"description"`
	EventTypeRaw         string     `json:"event_type_raw"`
	EventTypeID          *uuid.UUID `json:"event_type_id"`
	FieldID              *uuid.UUID `json:"field_id"`
	ParticipationModeID  *uuid.UUID `json:"participation_mode_id"`
	CompetitionLevelID   *uuid.UUID `json:"competition_level_id"`
	StartAt              time.Time  `json:"start_at" binding:"required"`
	EndAt                time.Time  `json:"end_at" binding:"required"`
	Timezone             string     `json:"timezone"`
	RegistrationStartAt  *time.Time `json:"registration_start_at"`
	RegistrationEndAt    *time.Time `json:"registration_end_at"`
	RegistrationDeadline *time.Time `json:"registration_deadline"`
	Capacity             int        `json:"capacity"`
	HydrationPayload     string     `json:"hydration_payload"`
	CoverFileID          *uuid.UUID `json:"cover_file_id"`
	IsSponsored          bool       `json:"is_sponsored"`
	Status               string     `json:"status"`
	CreatedBy            *uuid.UUID `json:"created_by"`
	// Inline location fields — if LocationName is set, a Location record is created automatically
	LocationName    string `json:"location_name"`
	LocationAddress string `json:"location_address1"`
	LocationCity    string `json:"location_city"`
	LocationCountry string `json:"location_country"`
	LocationType    string `json:"location_type"`
}

type UpdateEventRequest struct {
	LocationID           *uuid.UUID `json:"location_id"`
	Name                 string     `json:"name"`
	ShortDescription     string     `json:"short_description"`
	Description          string     `json:"description"`
	EventTypeRaw         string     `json:"event_type_raw"`
	EventTypeID          *uuid.UUID `json:"event_type_id"`
	FieldID              *uuid.UUID `json:"field_id"`
	ParticipationModeID  *uuid.UUID `json:"participation_mode_id"`
	CompetitionLevelID   *uuid.UUID `json:"competition_level_id"`
	StartAt              *time.Time `json:"start_at"`
	EndAt                *time.Time `json:"end_at"`
	Timezone             string     `json:"timezone"`
	RegistrationStartAt  *time.Time `json:"registration_start_at"`
	RegistrationEndAt    *time.Time `json:"registration_end_at"`
	RegistrationDeadline *time.Time `json:"registration_deadline"`
	Capacity             *int       `json:"capacity"`
	HydrationPayload     string     `json:"hydration_payload"`
	CoverFileID          *uuid.UUID `json:"cover_file_id"`
	IsSponsored          *bool      `json:"is_sponsored"`
	Status               string     `json:"status"`
}

type PaginatedEvents struct {
	Data       []models.Event `json:"data"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int64          `json:"total_pages"`
}

type eventService struct {
	repo repositories.EventRepository
	db   *gorm.DB
}

func NewEventService(repo repositories.EventRepository, db *gorm.DB) EventService {
	return &eventService{repo: repo, db: db}
}

func (s *eventService) GetAll(page, pageSize int, createdBy *uuid.UUID) (*PaginatedEvents, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	data, total, err := s.repo.GetAll(page, pageSize, createdBy)
	if err != nil {
		return nil, err
	}

	totalPages := total / int64(pageSize)
	if total%int64(pageSize) != 0 {
		totalPages++
	}

	return &PaginatedEvents{
		Data:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *eventService) GetByID(id uuid.UUID) (*models.Event, error) {
	return s.repo.GetByID(id)
}

func (s *eventService) GetByOrgID(orgID uuid.UUID) ([]models.Event, error) {
	return s.repo.GetByOrgID(orgID)
}

func (s *eventService) Create(req CreateEventRequest) (*models.Event, error) {
	locationID := req.LocationID

	// Create a Location record inline if location name is provided and no explicit LocationID was given
	if req.LocationName != "" && locationID == nil {
		loc := &models.Location{
			Name:     req.LocationName,
			Address1: req.LocationAddress,
			Province: req.LocationCity,
			Country:  req.LocationCountry,
		}
		if err := s.db.Create(loc).Error; err != nil {
			return nil, err
		}
		locationID = &loc.LocationID
	}

	event := &models.Event{
		OrgID:                req.OrgID,
		LocationID:           locationID,
		Name:                 req.Name,
		ShortDescription:     req.ShortDescription,
		Description:          req.Description,
		EventTypeRaw:         req.EventTypeRaw,
		EventTypeID:          req.EventTypeID,
		FieldID:              req.FieldID,
		ParticipationModeID:  req.ParticipationModeID,
		CompetitionLevelID:   req.CompetitionLevelID,
		StartAt:              req.StartAt,
		EndAt:                req.EndAt,
		Timezone:             req.Timezone,
		RegistrationStartAt:  req.RegistrationStartAt,
		RegistrationEndAt:    req.RegistrationEndAt,
		RegistrationDeadline: req.RegistrationDeadline,
		Capacity:             req.Capacity,
		RemainingSeats:       req.Capacity,
		HydrationPayload:     req.HydrationPayload,
		CoverFileID:          req.CoverFileID,
		IsSponsored:          req.IsSponsored,
		Status:               req.Status,
		CreatedBy:            req.CreatedBy,
	}
	if event.Status == "" {
		event.Status = "PENDING"
	}
	if err := s.repo.Create(event); err != nil {
		return nil, err
	}
	return event, nil
}

func (s *eventService) Update(id uuid.UUID, req UpdateEventRequest) (*models.Event, error) {
	event, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		event.Name = req.Name
	}
	if req.ShortDescription != "" {
		event.ShortDescription = req.ShortDescription
	}
	if req.Description != "" {
		event.Description = req.Description
	}
	if req.EventTypeRaw != "" {
		event.EventTypeRaw = req.EventTypeRaw
	}
	if req.LocationID != nil {
		event.LocationID = req.LocationID
	}
	if req.EventTypeID != nil {
		event.EventTypeID = req.EventTypeID
	}
	if req.FieldID != nil {
		event.FieldID = req.FieldID
	}
	if req.ParticipationModeID != nil {
		event.ParticipationModeID = req.ParticipationModeID
	}
	if req.CompetitionLevelID != nil {
		event.CompetitionLevelID = req.CompetitionLevelID
	}
	if req.StartAt != nil {
		event.StartAt = *req.StartAt
	}
	if req.EndAt != nil {
		event.EndAt = *req.EndAt
	}
	if req.Timezone != "" {
		event.Timezone = req.Timezone
	}
	if req.RegistrationStartAt != nil {
		event.RegistrationStartAt = req.RegistrationStartAt
	}
	if req.RegistrationEndAt != nil {
		event.RegistrationEndAt = req.RegistrationEndAt
	}
	if req.RegistrationDeadline != nil {
		event.RegistrationDeadline = req.RegistrationDeadline
	}
	if req.Capacity != nil {
		event.Capacity = *req.Capacity
	}
	if req.HydrationPayload != "" {
		event.HydrationPayload = req.HydrationPayload
	}
	if req.CoverFileID != nil {
		event.CoverFileID = req.CoverFileID
	}
	if req.IsSponsored != nil {
		event.IsSponsored = *req.IsSponsored
	}
	if req.Status != "" {
		event.Status = req.Status
	}

	if err := s.repo.Update(event); err != nil {
		return nil, err
	}
	return event, nil
}

func (s *eventService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
