package services

import (
	"medalverse-be/internal/models"
	"medalverse-be/internal/repositories"

	"github.com/google/uuid"
)

type OrganizationService interface {
	GetAll() ([]models.Organization, error)
	GetByID(id uuid.UUID) (*models.Organization, error)
	Create(req CreateOrganizationRequest) (*models.Organization, error)
	SubmitOnboarding(req SubmitOrganizationOnboardingRequest) (*models.OrganizationOnboardingSubmission, error)
	GetLatestOnboardingSubmissionByEmail(email string) (*models.OrganizationOnboardingSubmission, error)
	Update(id uuid.UUID, req UpdateOrganizationRequest) (*models.Organization, error)
	Delete(id uuid.UUID) error
}

type CreateOrganizationRequest struct {
	Abbreviation string     `json:"abbreviation"`
	Name         string     `json:"name" binding:"required"`
	Description  string     `json:"description"`
	LogoFileID   *uuid.UUID `json:"logo_file_id"`
	Website      string     `json:"website"`
}

type UpdateOrganizationRequest struct {
	Abbreviation string     `json:"abbreviation"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	LogoFileID   *uuid.UUID `json:"logo_file_id"`
	Website      string     `json:"website"`
	IsActive     *bool      `json:"is_active"`
}

type SubmitOrganizationOnboardingRequest struct {
	CreatedByUserID *uuid.UUID `json:"-"`
	OrgName         string     `json:"org_name" binding:"required"`
	Abbreviation string `json:"abbreviation"`
	OrgType      string `json:"org_type"`
	CustomOrgType string `json:"custom_org_type"`
	Country      string `json:"country"`
	City         string `json:"city"`

	Website     string `json:"website"`
	SocialMedia string `json:"social_media"`
	OtherURLs   string `json:"other_urls"`

	OfficialEmail       string `json:"official_email"`
	OfficialCountryCode string `json:"official_country_code"`
	OfficialPhoneNumber string `json:"official_phone_number"`

	RepresentativeName        string `json:"representative_name"`
	RepresentativeRole        string `json:"representative_role"`
	RepresentativeEmail       string `json:"representative_email"`
	RepresentativeCountryCode string `json:"representative_country_code"`
	RepresentativePhoneNumber string `json:"representative_phone_number"`

	AgreedToTerms       bool `json:"agreed_to_terms"`
	SubscribedToUpdates bool `json:"subscribed_to_updates"`
}

type organizationService struct {
	repo     repositories.OrganizationRepository
	userRepo repositories.UserRepository
}

func NewOrganizationService(repo repositories.OrganizationRepository, userRepo repositories.UserRepository) OrganizationService {
	return &organizationService{repo: repo, userRepo: userRepo}
}

func (s *organizationService) GetAll() ([]models.Organization, error) {
	return s.repo.GetAll()
}

func (s *organizationService) GetByID(id uuid.UUID) (*models.Organization, error) {
	return s.repo.GetByID(id)
}

func (s *organizationService) Create(req CreateOrganizationRequest) (*models.Organization, error) {
	org := &models.Organization{
		Abbreviation: req.Abbreviation,
		Name:         req.Name,
		Description:  req.Description,
		LogoFileID:   req.LogoFileID,
		Website:      req.Website,
		IsActive:     true,
	}
	if err := s.repo.Create(org); err != nil {
		return nil, err
	}
	return org, nil
}

func (s *organizationService) SubmitOnboarding(req SubmitOrganizationOnboardingRequest) (*models.OrganizationOnboardingSubmission, error) {
	submission := &models.OrganizationOnboardingSubmission{
		CreatedByUserID:         req.CreatedByUserID,
		OrgName:                 req.OrgName,
		Abbreviation:            req.Abbreviation,
		OrgType:                 req.OrgType,
		CustomOrgType:           req.CustomOrgType,
		Country:                 req.Country,
		City:                    req.City,
		Website:                 req.Website,
		SocialMedia:             req.SocialMedia,
		OtherURLs:               req.OtherURLs,
		OfficialEmail:           req.OfficialEmail,
		OfficialCountryCode:     req.OfficialCountryCode,
		OfficialPhoneNumber:     req.OfficialPhoneNumber,
		RepresentativeName:      req.RepresentativeName,
		RepresentativeRole:      req.RepresentativeRole,
		RepresentativeEmail:     req.RepresentativeEmail,
		RepresentativeCountryCode: req.RepresentativeCountryCode,
		RepresentativePhoneNumber: req.RepresentativePhoneNumber,
		AgreedToTerms:             req.AgreedToTerms,
		SubscribedToUpdates:       req.SubscribedToUpdates,
	}

	if err := s.repo.CreateOnboardingSubmission(submission); err != nil {
		return nil, err
	}
	return submission, nil
}

func (s *organizationService) GetLatestOnboardingSubmissionByEmail(email string) (*models.OrganizationOnboardingSubmission, error) {
	// First prioritize checking by email on the submission table directly.
	if submission, err := s.repo.GetLatestOnboardingSubmissionByEmail(email); err == nil {
		return submission, nil
	}

	// Fallback for cases where email may have changed but user ID is matching
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	return s.repo.GetLatestOnboardingSubmissionByUserID(user.UserID)
}

func (s *organizationService) Update(id uuid.UUID, req UpdateOrganizationRequest) (*models.Organization, error) {
	org, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Abbreviation != "" {
		org.Abbreviation = req.Abbreviation
	}
	if req.Name != "" {
		org.Name = req.Name
	}
	if req.Description != "" {
		org.Description = req.Description
	}
	if req.LogoFileID != nil {
		org.LogoFileID = req.LogoFileID
	}
	if req.Website != "" {
		org.Website = req.Website
	}
	if req.IsActive != nil {
		org.IsActive = *req.IsActive
	}

	if err := s.repo.Update(org); err != nil {
		return nil, err
	}
	return org, nil
}

func (s *organizationService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
