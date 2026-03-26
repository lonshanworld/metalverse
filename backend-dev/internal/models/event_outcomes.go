package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Outcome struct {
	OutcomeID   uuid.UUID `gorm:"column:outcome_id;type:uuid;primaryKey" json:"outcome_id"`
	Title       string    `gorm:"column:title;type:text;not null" json:"title"`
	Description string    `gorm:"column:description;type:text" json:"description"`
}

func (Outcome) TableName() string { return "outcomes" }

func (o *Outcome) BeforeCreate(tx *gorm.DB) error {
	if o.OutcomeID == uuid.Nil {
		o.OutcomeID = uuid.New()
	}
	return nil
}

type EventOutcome struct {
	EventID   uuid.UUID `gorm:"column:event_id;type:uuid;primaryKey" json:"event_id"`
	OutcomeID uuid.UUID `gorm:"column:outcome_id;type:uuid;primaryKey" json:"outcome_id"`
	Position  int       `gorm:"column:position;type:int" json:"position"`

	Event   *Event   `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	Outcome *Outcome `gorm:"foreignKey:OutcomeID;references:OutcomeID" json:"outcome,omitempty"`
}

func (EventOutcome) TableName() string { return "event_outcomes" }
