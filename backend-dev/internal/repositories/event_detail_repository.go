package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventFileRepository interface {
	GetByEventID(eventID uuid.UUID) ([]models.EventFile, error)
	Create(file *models.EventFile) error
	Delete(id uuid.UUID) error
}

type eventFileRepository struct{ db *gorm.DB }

func NewEventFileRepository(db *gorm.DB) EventFileRepository {
	return &eventFileRepository{db: db}
}

func (r *eventFileRepository) GetByEventID(eventID uuid.UUID) ([]models.EventFile, error) {
	var files []models.EventFile
	if err := r.db.Preload("File").Where("event_id = ?", eventID).Order("role, sequence").Find(&files).Error; err != nil {
		return nil, err
	}
	return files, nil
}

func (r *eventFileRepository) Create(file *models.EventFile) error {
	return r.db.Create(file).Error
}

func (r *eventFileRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.EventFile{}, "event_file_id = ?", id).Error
}
type TagRepository interface {
	GetAll() ([]models.Tag, error)
	GetOrCreate(name string) (*models.Tag, error)
	GetByEventID(eventID uuid.UUID) ([]models.Tag, error)
	SetEventTags(eventID uuid.UUID, tagIDs []uuid.UUID) error
}

type tagRepository struct{ db *gorm.DB }

func NewTagRepository(db *gorm.DB) TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) GetAll() ([]models.Tag, error) {
	var tags []models.Tag
	if err := r.db.Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *tagRepository) GetOrCreate(name string) (*models.Tag, error) {
	var tag models.Tag
	if err := r.db.Where("name = ?", name).FirstOrCreate(&tag, models.Tag{Name: name}).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) GetByEventID(eventID uuid.UUID) ([]models.Tag, error) {
	var tags []models.Tag
	if err := r.db.
		Joins("JOIN event_tags ON event_tags.tag_id = tags.tag_id").
		Where("event_tags.event_id = ?", eventID).
		Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *tagRepository) SetEventTags(eventID uuid.UUID, tagIDs []uuid.UUID) error {
	// Remove existing
	if err := r.db.Where("event_id = ?", eventID).Delete(&models.EventTag{}).Error; err != nil {
		return err
	}
	// Insert new
	for _, tagID := range tagIDs {
		et := models.EventTag{EventID: eventID, TagID: tagID}
		if err := r.db.Create(&et).Error; err != nil {
			return err
		}
	}
	return nil
}

// ─── EventAgendaItem ───

type EventAgendaItemRepository interface {
	GetByEventID(eventID uuid.UUID) ([]models.EventAgendaItem, error)
	Create(item *models.EventAgendaItem) error
	Update(item *models.EventAgendaItem) error
	Delete(id uuid.UUID) error
	DeleteByEventID(eventID uuid.UUID) error
}

type eventAgendaItemRepository struct{ db *gorm.DB }

func NewEventAgendaItemRepository(db *gorm.DB) EventAgendaItemRepository {
	return &eventAgendaItemRepository{db: db}
}

func (r *eventAgendaItemRepository) GetByEventID(eventID uuid.UUID) ([]models.EventAgendaItem, error) {
	var items []models.EventAgendaItem
	if err := r.db.Where("event_id = ?", eventID).Order("position").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *eventAgendaItemRepository) Create(item *models.EventAgendaItem) error {
	return r.db.Create(item).Error
}
func (r *eventAgendaItemRepository) Update(item *models.EventAgendaItem) error {
	return r.db.Save(item).Error
}
func (r *eventAgendaItemRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.EventAgendaItem{}, "agenda_item_id = ?", id).Error
}
func (r *eventAgendaItemRepository) DeleteByEventID(eventID uuid.UUID) error {
	return r.db.Where("event_id = ?", eventID).Delete(&models.EventAgendaItem{}).Error
}

// ─── Speaker ───

type SpeakerRepository interface {
	GetAll() ([]models.Speaker, error)
	GetByID(id uuid.UUID) (*models.Speaker, error)
	GetByEventID(eventID uuid.UUID) ([]models.EventSpeaker, error)
	Create(speaker *models.Speaker) error
	Update(speaker *models.Speaker) error
	Delete(id uuid.UUID) error
	SetEventSpeakers(eventID uuid.UUID, speakers []models.EventSpeaker) error
}

type speakerRepository struct{ db *gorm.DB }

func NewSpeakerRepository(db *gorm.DB) SpeakerRepository {
	return &speakerRepository{db: db}
}

func (r *speakerRepository) GetAll() ([]models.Speaker, error) {
	var speakers []models.Speaker
	if err := r.db.Preload("Avatar").Find(&speakers).Error; err != nil {
		return nil, err
	}
	return speakers, nil
}

func (r *speakerRepository) GetByID(id uuid.UUID) (*models.Speaker, error) {
	var speaker models.Speaker
	if err := r.db.Preload("Avatar").First(&speaker, "speaker_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &speaker, nil
}

func (r *speakerRepository) GetByEventID(eventID uuid.UUID) ([]models.EventSpeaker, error) {
	var eventSpeakers []models.EventSpeaker
	if err := r.db.
		Preload("Speaker").
		Preload("Speaker.Avatar").
		Where("event_id = ?", eventID).
		Order("position").
		Find(&eventSpeakers).Error; err != nil {
		return nil, err
	}
	return eventSpeakers, nil
}

func (r *speakerRepository) Create(speaker *models.Speaker) error {
	return r.db.Create(speaker).Error
}
func (r *speakerRepository) Update(speaker *models.Speaker) error {
	return r.db.Save(speaker).Error
}
func (r *speakerRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Speaker{}, "speaker_id = ?", id).Error
}

func (r *speakerRepository) SetEventSpeakers(eventID uuid.UUID, speakers []models.EventSpeaker) error {
	if err := r.db.Where("event_id = ?", eventID).Delete(&models.EventSpeaker{}).Error; err != nil {
		return err
	}
	for i := range speakers {
		speakers[i].EventID = eventID
		if err := r.db.Create(&speakers[i]).Error; err != nil {
			return err
		}
	}
	return nil
}

// ─── Outcome ───

type OutcomeRepository interface {
	GetByEventID(eventID uuid.UUID) ([]models.EventOutcome, error)
	SetEventOutcomes(eventID uuid.UUID, outcomes []models.EventOutcome) error
}

type outcomeRepository struct{ db *gorm.DB }

func NewOutcomeRepository(db *gorm.DB) OutcomeRepository {
	return &outcomeRepository{db: db}
}

func (r *outcomeRepository) GetByEventID(eventID uuid.UUID) ([]models.EventOutcome, error) {
	var items []models.EventOutcome
	if err := r.db.Preload("Outcome").Where("event_id = ?", eventID).Order("position").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *outcomeRepository) SetEventOutcomes(eventID uuid.UUID, outcomes []models.EventOutcome) error {
	if err := r.db.Where("event_id = ?", eventID).Delete(&models.EventOutcome{}).Error; err != nil {
		return err
	}
	for i := range outcomes {
		outcomes[i].EventID = eventID
		if err := r.db.Create(&outcomes[i]).Error; err != nil {
			return err
		}
	}
	return nil
}

// ─── Eligibility ───

type EventEligibilityRepository interface {
	GetByEventID(eventID uuid.UUID) ([]models.EventEligibility, error)
	SetEventEligibilities(eventID uuid.UUID, eligibilityIDs []uuid.UUID) error
}

type eventEligibilityRepository struct{ db *gorm.DB }

func NewEventEligibilityRepository(db *gorm.DB) EventEligibilityRepository {
	return &eventEligibilityRepository{db: db}
}

func (r *eventEligibilityRepository) GetByEventID(eventID uuid.UUID) ([]models.EventEligibility, error) {
	var items []models.EventEligibility
	if err := r.db.Preload("EligibilityGroup").Where("event_id = ?", eventID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *eventEligibilityRepository) SetEventEligibilities(eventID uuid.UUID, eligibilityIDs []uuid.UUID) error {
	if err := r.db.Where("event_id = ?", eventID).Delete(&models.EventEligibility{}).Error; err != nil {
		return err
	}
	for _, eid := range eligibilityIDs {
		ee := models.EventEligibility{EventID: eventID, EligibilityID: eid}
		if err := r.db.Create(&ee).Error; err != nil {
			return err
		}
	}
	return nil
}
