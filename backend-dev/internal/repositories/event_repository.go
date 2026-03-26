package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventRepository interface {
	GetAll(page, pageSize int, createdBy *uuid.UUID) ([]models.Event, int64, error)
	GetByID(id uuid.UUID) (*models.Event, error)
	GetByOrgID(orgID uuid.UUID) ([]models.Event, error)
	Create(event *models.Event) error
	Update(event *models.Event) error
	Delete(id uuid.UUID) error
}

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) EventRepository {
	return &eventRepository{db: db}
}

func (r *eventRepository) GetAll(page, pageSize int, createdBy *uuid.UUID) ([]models.Event, int64, error) {
	var events []models.Event
	var total int64

	offset := (page - 1) * pageSize
	query := r.db.Model(&models.Event{})
	if createdBy != nil {
		query = query.Where("created_by = ?", *createdBy)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.
		Preload("Organization").
		Preload("Location").
		Preload("EventType").
		Preload("Field").
		Preload("ParticipationMode").
		Preload("CompetitionLevel").
		Preload("CoverFile").
		Order("created_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&events).Error; err != nil {
		return nil, 0, err
	}
	return events, total, nil
}

func (r *eventRepository) GetByID(id uuid.UUID) (*models.Event, error) {
	var event models.Event
	if err := r.db.
		Preload("Organization").
		Preload("Location").
		Preload("EventType").
		Preload("Field").
		Preload("ParticipationMode").
		Preload("CompetitionLevel").
		Preload("CoverFile").
		Preload("Creator").
		First(&event, "event_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &event, nil
}

func (r *eventRepository) GetByOrgID(orgID uuid.UUID) ([]models.Event, error) {
	var events []models.Event
	if err := r.db.
		Preload("EventType").
		Preload("CoverFile").
		Where("org_id = ?", orgID).
		Order("created_at DESC").
		Find(&events).Error; err != nil {
		return nil, err
	}
	return events, nil
}

func (r *eventRepository) Create(event *models.Event) error {
	return r.db.Create(event).Error
}

func (r *eventRepository) Update(event *models.Event) error {
	return r.db.Save(event).Error
}

func (r *eventRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Event{}, "event_id = ?", id).Error
}
