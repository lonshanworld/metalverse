package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EligibilityGroup struct {
	EligibilityID uuid.UUID `gorm:"column:eligibility_id;type:uuid;primaryKey" json:"eligibility_id"`
	Code          string    `gorm:"column:code;type:text;not null;unique" json:"code"`
	Name          string    `gorm:"column:name;type:text;not null" json:"name"`
	IsActive      bool      `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
}

func (EligibilityGroup) TableName() string { return "eligibility_groups" }

func (e *EligibilityGroup) BeforeCreate(tx *gorm.DB) error {
	if e.EligibilityID == uuid.Nil {
		e.EligibilityID = uuid.New()
	}
	return nil
}

type EventEligibility struct {
	EventID       uuid.UUID `gorm:"column:event_id;type:uuid;primaryKey" json:"event_id"`
	EligibilityID uuid.UUID `gorm:"column:eligibility_id;type:uuid;primaryKey" json:"eligibility_id"`

	Event            *Event            `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	EligibilityGroup *EligibilityGroup `gorm:"foreignKey:EligibilityID;references:EligibilityID" json:"eligibility_group,omitempty"`
}

func (EventEligibility) TableName() string { return "event_eligibilities" }
