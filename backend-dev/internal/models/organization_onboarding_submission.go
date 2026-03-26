package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrganizationOnboardingSubmission struct {
	SubmissionID    uuid.UUID  `gorm:"column:submission_id;type:uuid;primaryKey" json:"submission_id"`
	CreatedByUserID *uuid.UUID `gorm:"column:created_by_user_id;type:uuid;index" json:"created_by_user_id"`
	OrgName         string     `gorm:"column:org_name;type:text;not null" json:"org_name"`
	Abbreviation string         `gorm:"column:abbreviation;type:text" json:"abbreviation"`
	OrgType      string         `gorm:"column:org_type;type:text" json:"org_type"`
	CustomOrgType string        `gorm:"column:custom_org_type;type:text" json:"custom_org_type"`
	Country      string         `gorm:"column:country;type:text" json:"country"`
	City         string         `gorm:"column:city;type:text" json:"city"`

	Website     string `gorm:"column:website;type:text" json:"website"`
	SocialMedia string `gorm:"column:social_media;type:text" json:"social_media"`
	OtherURLs   string `gorm:"column:other_urls;type:text" json:"other_urls"`

	OfficialEmail       string `gorm:"column:official_email;type:text" json:"official_email"`
	OfficialCountryCode string `gorm:"column:official_country_code;type:text" json:"official_country_code"`
	OfficialPhoneNumber string `gorm:"column:official_phone_number;type:text" json:"official_phone_number"`

	RepresentativeName        string `gorm:"column:representative_name;type:text" json:"representative_name"`
	RepresentativeRole        string `gorm:"column:representative_role;type:text" json:"representative_role"`
	RepresentativeEmail       string `gorm:"column:representative_email;type:text" json:"representative_email"`
	RepresentativeCountryCode string `gorm:"column:representative_country_code;type:text" json:"representative_country_code"`
	RepresentativePhoneNumber string `gorm:"column:representative_phone_number;type:text" json:"representative_phone_number"`

	AgreedToTerms      bool `gorm:"column:agreed_to_terms;type:boolean;not null;default:false" json:"agreed_to_terms"`
	SubscribedToUpdates bool `gorm:"column:subscribed_to_updates;type:boolean;not null;default:false" json:"subscribed_to_updates"`

	CreatedAt time.Time      `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at;type:timestamptz;autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (OrganizationOnboardingSubmission) TableName() string { return "organization_onboarding_submissions" }

func (s *OrganizationOnboardingSubmission) BeforeCreate(tx *gorm.DB) error {
	if s.SubmissionID == uuid.Nil {
		s.SubmissionID = uuid.New()
	}
	return nil
}

