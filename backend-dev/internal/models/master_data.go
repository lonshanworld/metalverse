package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventType struct {
	EventTypeID uuid.UUID `gorm:"column:event_type_id;type:uuid;primaryKey" json:"event_type_id"`
	Code        string    `gorm:"column:code;type:text;not null;unique" json:"code"`
	Name        string    `gorm:"column:name;type:text;not null" json:"name"`
	IsActive    bool      `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
}

func (EventType) TableName() string { return "event_types" }

func (e *EventType) BeforeCreate(tx *gorm.DB) error {
	if e.EventTypeID == uuid.Nil {
		e.EventTypeID = uuid.New()
	}
	return nil
}

type Field struct {
	FieldID  uuid.UUID `gorm:"column:field_id;type:uuid;primaryKey" json:"field_id"`
	Code     string    `gorm:"column:code;type:text;not null;unique" json:"code"`
	Name     string    `gorm:"column:name;type:text;not null" json:"name"`
	IsActive bool      `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
}

func (Field) TableName() string { return "fields" }

func (f *Field) BeforeCreate(tx *gorm.DB) error {
	if f.FieldID == uuid.Nil {
		f.FieldID = uuid.New()
	}
	return nil
}

type ParticipationMode struct {
	ParticipationModeID uuid.UUID `gorm:"column:participation_mode_id;type:uuid;primaryKey" json:"participation_mode_id"`
	Code                string    `gorm:"column:code;type:text;not null;unique" json:"code"`
	Name                string    `gorm:"column:name;type:text;not null" json:"name"`
	IsActive            bool      `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
}

func (ParticipationMode) TableName() string { return "participation_modes" }

func (p *ParticipationMode) BeforeCreate(tx *gorm.DB) error {
	if p.ParticipationModeID == uuid.Nil {
		p.ParticipationModeID = uuid.New()
	}
	return nil
}

type CompetitionLevel struct {
	CompetitionLevelID uuid.UUID `gorm:"column:competition_level_id;type:uuid;primaryKey" json:"competition_level_id"`
	Code               string    `gorm:"column:code;type:text;not null;unique" json:"code"`
	Name               string    `gorm:"column:name;type:text;not null" json:"name"`
	IsActive           bool      `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
}

func (CompetitionLevel) TableName() string { return "competition_levels" }

func (c *CompetitionLevel) BeforeCreate(tx *gorm.DB) error {
	if c.CompetitionLevelID == uuid.Nil {
		c.CompetitionLevelID = uuid.New()
	}
	return nil
}
