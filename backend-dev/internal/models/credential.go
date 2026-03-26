package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CredentialType string

const (
	CredentialTypeCertificate CredentialType = "CERTIFICATE"
	CredentialTypeTrophy      CredentialType = "TROPHY"
	CredentialTypeMedal       CredentialType = "MEDAL"
	CredentialTypeBadge       CredentialType = "BADGE"
)

type Credential struct {
	CredentialID   uuid.UUID      `gorm:"column:credential_id;type:uuid;primaryKey" json:"credential_id"`
	EventID        uuid.UUID      `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	UserID         uuid.UUID      `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	RegistrationID *uuid.UUID     `gorm:"column:registration_id;type:uuid;index" json:"registration_id"`
	Name           string         `gorm:"column:name;type:text" json:"name"`
	Type           CredentialType `gorm:"column:type;type:text" json:"type"`
	RecipientName  string         `gorm:"column:recipient_name;type:text" json:"recipient_name"`
	FieldID        *uuid.UUID     `gorm:"column:field_id;type:uuid;index" json:"field_id"`
	Rank           string         `gorm:"column:rank;type:text" json:"rank"`
	IssueDate      time.Time      `gorm:"column:issue_date;type:timestamptz" json:"issue_date"`
	KeyLearning    string         `gorm:"column:key_learning;type:text" json:"key_learning"`
	IsPrivate      bool           `gorm:"column:is_private;type:boolean;default:false" json:"is_private"`
	CreatedAt      time.Time      `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"column:updated_at;type:timestamptz;autoUpdateTime" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Event        *Event             `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	User         *User              `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	Registration *EventRegistration `gorm:"foreignKey:RegistrationID;references:RegistrationID" json:"registration,omitempty"`
	Field        *Field             `gorm:"foreignKey:FieldID;references:FieldID" json:"field,omitempty"`
}

func (Credential) TableName() string { return "credentials" }

func (c *Credential) BeforeCreate(tx *gorm.DB) error {
	if c.CredentialID == uuid.Nil {
		c.CredentialID = uuid.New()
	}
	return nil
}
