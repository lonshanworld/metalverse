package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MedalVerseCodeRepository interface {
	GetAll() ([]models.MedalVerseCode, error)
	GetByID(id uuid.UUID) (*models.MedalVerseCode, error)
	GetByCode(code string) (*models.MedalVerseCode, error)
	GetByEventID(eventID uuid.UUID) ([]models.MedalVerseCode, error)
	Create(code *models.MedalVerseCode) error
	Update(code *models.MedalVerseCode) error
	Delete(id uuid.UUID) error
}

type medalVerseCodeRepository struct {
	db *gorm.DB
}

func NewMedalVerseCodeRepository(db *gorm.DB) MedalVerseCodeRepository {
	return &medalVerseCodeRepository{db: db}
}

func (r *medalVerseCodeRepository) GetAll() ([]models.MedalVerseCode, error) {
	var codes []models.MedalVerseCode
	if err := r.db.Find(&codes).Error; err != nil {
		return nil, err
	}
	return codes, nil
}

func (r *medalVerseCodeRepository) GetByID(id uuid.UUID) (*models.MedalVerseCode, error) {
	var code models.MedalVerseCode
	if err := r.db.Preload("Event").First(&code, "code_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &code, nil
}

func (r *medalVerseCodeRepository) GetByCode(codeStr string) (*models.MedalVerseCode, error) {
	var code models.MedalVerseCode
	if err := r.db.Preload("Event").Where("code = ?", codeStr).First(&code).Error; err != nil {
		return nil, err
	}
	return &code, nil
}

func (r *medalVerseCodeRepository) GetByEventID(eventID uuid.UUID) ([]models.MedalVerseCode, error) {
	var codes []models.MedalVerseCode
	if err := r.db.Where("event_id = ?", eventID).Find(&codes).Error; err != nil {
		return nil, err
	}
	return codes, nil
}

func (r *medalVerseCodeRepository) Create(code *models.MedalVerseCode) error {
	return r.db.Create(code).Error
}

func (r *medalVerseCodeRepository) Update(code *models.MedalVerseCode) error {
	return r.db.Save(code).Error
}

func (r *medalVerseCodeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.MedalVerseCode{}, "code_id = ?", id).Error
}
