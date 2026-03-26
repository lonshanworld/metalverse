package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CredentialRepository interface {
	GetAll() ([]models.Credential, error)
	GetAllPaginated(page, pageSize int) ([]models.Credential, int64, error)
	GetByID(id uuid.UUID) (*models.Credential, error)
	GetByUserID(userID uuid.UUID) ([]models.Credential, error)
	GetByEventID(eventID uuid.UUID) ([]models.Credential, error)
	Create(credential *models.Credential) error
	Update(credential *models.Credential) error
	Delete(id uuid.UUID) error
}

type credentialRepository struct {
	db *gorm.DB
}

func NewCredentialRepository(db *gorm.DB) CredentialRepository {
	return &credentialRepository{db: db}
}

func (r *credentialRepository) GetAll() ([]models.Credential, error) {
	var credentials []models.Credential
	if err := r.db.Preload("Event").Preload("User").Preload("Field").Find(&credentials).Error; err != nil {
		return nil, err
	}
	return credentials, nil
}

func (r *credentialRepository) GetAllPaginated(page, pageSize int) ([]models.Credential, int64, error) {
	var credentials []models.Credential
	var total int64

	offset := (page - 1) * pageSize

	if err := r.db.Model(&models.Credential{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := r.db.
		Preload("Event").
		Preload("User").
		Preload("Field").
		Offset(offset).Limit(pageSize).
		Find(&credentials).Error; err != nil {
		return nil, 0, err
	}
	return credentials, total, nil
}

func (r *credentialRepository) GetByID(id uuid.UUID) (*models.Credential, error) {
	var credential models.Credential
	if err := r.db.
		Preload("Event").
		Preload("User").
		Preload("Registration").
		Preload("Field").
		First(&credential, "credential_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &credential, nil
}

func (r *credentialRepository) GetByUserID(userID uuid.UUID) ([]models.Credential, error) {
	var credentials []models.Credential
	if err := r.db.
		Preload("Event").
		Preload("Field").
		Where("user_id = ?", userID).
		Find(&credentials).Error; err != nil {
		return nil, err
	}
	return credentials, nil
}

func (r *credentialRepository) GetByEventID(eventID uuid.UUID) ([]models.Credential, error) {
	var credentials []models.Credential
	if err := r.db.
		Preload("User").
		Preload("Field").
		Where("event_id = ?", eventID).
		Find(&credentials).Error; err != nil {
		return nil, err
	}
	return credentials, nil
}

func (r *credentialRepository) Create(credential *models.Credential) error {
	return r.db.Create(credential).Error
}

func (r *credentialRepository) Update(credential *models.Credential) error {
	return r.db.Save(credential).Error
}

func (r *credentialRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Credential{}, "credential_id = ?", id).Error
}
