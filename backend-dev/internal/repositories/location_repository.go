package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LocationRepository interface {
	GetAll() ([]models.Location, error)
	GetByID(id uuid.UUID) (*models.Location, error)
	Create(location *models.Location) error
	Update(location *models.Location) error
	Delete(id uuid.UUID) error
}

type locationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) LocationRepository {
	return &locationRepository{db: db}
}

func (r *locationRepository) GetAll() ([]models.Location, error) {
	var locations []models.Location
	if err := r.db.Find(&locations).Error; err != nil {
		return nil, err
	}
	return locations, nil
}

func (r *locationRepository) GetByID(id uuid.UUID) (*models.Location, error) {
	var location models.Location
	if err := r.db.First(&location, "location_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &location, nil
}

func (r *locationRepository) Create(location *models.Location) error {
	return r.db.Create(location).Error
}

func (r *locationRepository) Update(location *models.Location) error {
	return r.db.Save(location).Error
}

func (r *locationRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Location{}, "location_id = ?", id).Error
}
