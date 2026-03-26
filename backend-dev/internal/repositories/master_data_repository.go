package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─── Master Data: EventType ───

type EventTypeRepository interface {
	GetAll() ([]models.EventType, error)
	GetByID(id uuid.UUID) (*models.EventType, error)
	Create(et *models.EventType) error
	Update(et *models.EventType) error
	Delete(id uuid.UUID) error
}

type eventTypeRepository struct{ db *gorm.DB }

func NewEventTypeRepository(db *gorm.DB) EventTypeRepository {
	return &eventTypeRepository{db: db}
}

func (r *eventTypeRepository) GetAll() ([]models.EventType, error) {
	var items []models.EventType
	if err := r.db.Where("is_active = ?", true).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *eventTypeRepository) GetByID(id uuid.UUID) (*models.EventType, error) {
	var item models.EventType
	if err := r.db.First(&item, "event_type_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *eventTypeRepository) Create(et *models.EventType) error { return r.db.Create(et).Error }
func (r *eventTypeRepository) Update(et *models.EventType) error { return r.db.Save(et).Error }
func (r *eventTypeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.EventType{}, "event_type_id = ?", id).Error
}

// ─── Master Data: Field ───

type FieldRepository interface {
	GetAll() ([]models.Field, error)
	GetByID(id uuid.UUID) (*models.Field, error)
	Create(f *models.Field) error
	Update(f *models.Field) error
	Delete(id uuid.UUID) error
}

type fieldRepository struct{ db *gorm.DB }

func NewFieldRepository(db *gorm.DB) FieldRepository {
	return &fieldRepository{db: db}
}

func (r *fieldRepository) GetAll() ([]models.Field, error) {
	var items []models.Field
	if err := r.db.Where("is_active = ?", true).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *fieldRepository) GetByID(id uuid.UUID) (*models.Field, error) {
	var item models.Field
	if err := r.db.First(&item, "field_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *fieldRepository) Create(f *models.Field) error { return r.db.Create(f).Error }
func (r *fieldRepository) Update(f *models.Field) error { return r.db.Save(f).Error }
func (r *fieldRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Field{}, "field_id = ?", id).Error
}

// ─── Master Data: ParticipationMode ───

type ParticipationModeRepository interface {
	GetAll() ([]models.ParticipationMode, error)
	GetByID(id uuid.UUID) (*models.ParticipationMode, error)
	Create(pm *models.ParticipationMode) error
	Update(pm *models.ParticipationMode) error
	Delete(id uuid.UUID) error
}

type participationModeRepository struct{ db *gorm.DB }

func NewParticipationModeRepository(db *gorm.DB) ParticipationModeRepository {
	return &participationModeRepository{db: db}
}

func (r *participationModeRepository) GetAll() ([]models.ParticipationMode, error) {
	var items []models.ParticipationMode
	if err := r.db.Where("is_active = ?", true).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *participationModeRepository) GetByID(id uuid.UUID) (*models.ParticipationMode, error) {
	var item models.ParticipationMode
	if err := r.db.First(&item, "participation_mode_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *participationModeRepository) Create(pm *models.ParticipationMode) error {
	return r.db.Create(pm).Error
}
func (r *participationModeRepository) Update(pm *models.ParticipationMode) error {
	return r.db.Save(pm).Error
}
func (r *participationModeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.ParticipationMode{}, "participation_mode_id = ?", id).Error
}

// ─── Master Data: CompetitionLevel ───

type CompetitionLevelRepository interface {
	GetAll() ([]models.CompetitionLevel, error)
	GetByID(id uuid.UUID) (*models.CompetitionLevel, error)
	Create(cl *models.CompetitionLevel) error
	Update(cl *models.CompetitionLevel) error
	Delete(id uuid.UUID) error
}

type competitionLevelRepository struct{ db *gorm.DB }

func NewCompetitionLevelRepository(db *gorm.DB) CompetitionLevelRepository {
	return &competitionLevelRepository{db: db}
}

func (r *competitionLevelRepository) GetAll() ([]models.CompetitionLevel, error) {
	var items []models.CompetitionLevel
	if err := r.db.Where("is_active = ?", true).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *competitionLevelRepository) GetByID(id uuid.UUID) (*models.CompetitionLevel, error) {
	var item models.CompetitionLevel
	if err := r.db.First(&item, "competition_level_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *competitionLevelRepository) Create(cl *models.CompetitionLevel) error {
	return r.db.Create(cl).Error
}
func (r *competitionLevelRepository) Update(cl *models.CompetitionLevel) error {
	return r.db.Save(cl).Error
}
func (r *competitionLevelRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.CompetitionLevel{}, "competition_level_id = ?", id).Error
}

// ─── Master Data: EligibilityGroup ───

type EligibilityGroupRepository interface {
	GetAll() ([]models.EligibilityGroup, error)
	GetByID(id uuid.UUID) (*models.EligibilityGroup, error)
	Create(eg *models.EligibilityGroup) error
	Update(eg *models.EligibilityGroup) error
	Delete(id uuid.UUID) error
}

type eligibilityGroupRepository struct{ db *gorm.DB }

func NewEligibilityGroupRepository(db *gorm.DB) EligibilityGroupRepository {
	return &eligibilityGroupRepository{db: db}
}

func (r *eligibilityGroupRepository) GetAll() ([]models.EligibilityGroup, error) {
	var items []models.EligibilityGroup
	if err := r.db.Where("is_active = ?", true).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *eligibilityGroupRepository) GetByID(id uuid.UUID) (*models.EligibilityGroup, error) {
	var item models.EligibilityGroup
	if err := r.db.First(&item, "eligibility_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *eligibilityGroupRepository) Create(eg *models.EligibilityGroup) error {
	return r.db.Create(eg).Error
}
func (r *eligibilityGroupRepository) Update(eg *models.EligibilityGroup) error {
	return r.db.Save(eg).Error
}
func (r *eligibilityGroupRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.EligibilityGroup{}, "eligibility_id = ?", id).Error
}
