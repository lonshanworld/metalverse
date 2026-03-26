package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventAgendaItem struct {
	AgendaItemID uuid.UUID  `gorm:"column:agenda_item_id;type:uuid;primaryKey" json:"agenda_item_id"`
	EventID      uuid.UUID  `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	StartAt      *time.Time `gorm:"column:start_at;type:timestamptz" json:"start_at"`
	EndAt        *time.Time `gorm:"column:end_at;type:timestamptz" json:"end_at"`
	Title        string     `gorm:"column:title;type:text;not null" json:"title"`
	Description  string     `gorm:"column:description;type:text" json:"description"`
	Position     int        `gorm:"column:position;type:int" json:"position"`

	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
}

func (EventAgendaItem) TableName() string { return "event_agenda_items" }

func (e *EventAgendaItem) BeforeCreate(tx *gorm.DB) error {
	if e.AgendaItemID == uuid.Nil {
		e.AgendaItemID = uuid.New()
	}
	return nil
}
