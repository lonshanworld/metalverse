package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Organization struct {
	OrgID        uuid.UUID      `gorm:"column:org_id;type:uuid;primaryKey" json:"org_id"`
	Abbreviation string         `gorm:"column:abbreviation;type:text" json:"abbreviation"`
	Name         string         `gorm:"column:name;type:text;not null" json:"name"`
	Description  string         `gorm:"column:description;type:text" json:"description"`
	LogoFileID   *uuid.UUID     `gorm:"column:logo_file_id;type:uuid" json:"logo_file_id"`
	Website      string         `gorm:"column:website;type:text" json:"website"`
	IsActive     bool           `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
	CreatedAt    time.Time      `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"column:updated_at;type:timestamptz;autoUpdateTime" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Logo *File `gorm:"foreignKey:LogoFileID;references:FileID" json:"logo,omitempty"`
}

func (Organization) TableName() string { return "organizations" }

func (o *Organization) BeforeCreate(tx *gorm.DB) error {
	if o.OrgID == uuid.Nil {
		o.OrgID = uuid.New()
	}
	return nil
}
