package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrganizationRepository interface {
	GetAll() ([]models.Organization, error)
	GetByID(id uuid.UUID) (*models.Organization, error)
	Create(org *models.Organization) error
	CreateOnboardingSubmission(submission *models.OrganizationOnboardingSubmission) error
	GetLatestOnboardingSubmissionByEmail(email string) (*models.OrganizationOnboardingSubmission, error)
	GetLatestOnboardingSubmissionByUserID(userID uuid.UUID) (*models.OrganizationOnboardingSubmission, error)
	Update(org *models.Organization) error
	Delete(id uuid.UUID) error
}

type organizationRepository struct {
	db *gorm.DB
}

func NewOrganizationRepository(db *gorm.DB) OrganizationRepository {
	return &organizationRepository{db: db}
}

func (r *organizationRepository) GetAll() ([]models.Organization, error) {
	var orgs []models.Organization
	if err := r.db.Find(&orgs).Error; err != nil {
		return nil, err
	}
	return orgs, nil
}

func (r *organizationRepository) GetByID(id uuid.UUID) (*models.Organization, error) {
	var org models.Organization
	if err := r.db.First(&org, "org_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &org, nil
}

func (r *organizationRepository) Create(org *models.Organization) error {
	return r.db.Create(org).Error
}

func (r *organizationRepository) CreateOnboardingSubmission(submission *models.OrganizationOnboardingSubmission) error {
	return r.db.Create(submission).Error
}

func (r *organizationRepository) GetLatestOnboardingSubmissionByEmail(email string) (*models.OrganizationOnboardingSubmission, error) {
	var submission models.OrganizationOnboardingSubmission
	if err := r.db.
		Where("official_email = ? OR representative_email = ?", email, email).
		Order("created_at desc").
		First(&submission).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

func (r *organizationRepository) GetLatestOnboardingSubmissionByUserID(userID uuid.UUID) (*models.OrganizationOnboardingSubmission, error) {
	var submission models.OrganizationOnboardingSubmission
	if err := r.db.
		Where("created_by_user_id = ?", userID).
		Order("created_at desc").
		First(&submission).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

func (r *organizationRepository) Update(org *models.Organization) error {
	return r.db.Save(org).Error
}

func (r *organizationRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Organization{}, "org_id = ?", id).Error
}
