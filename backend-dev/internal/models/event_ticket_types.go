package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventTicketType struct {
	TicketTypeID uuid.UUID `gorm:"column:ticket_type_id;type:uuid;primaryKey" json:"ticket_type_id"`
	EventID      uuid.UUID `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	Name         string    `gorm:"column:name;type:text;not null" json:"name"` // Free, Standard, VIP
	Price        float64   `gorm:"column:price;type:numeric;default:0" json:"price"`
	Currency     string    `gorm:"column:currency;type:text;default:'THB'" json:"currency"`
	Capacity     int       `gorm:"column:capacity;type:int" json:"capacity"`
	CreatedAt    time.Time `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`

	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
}

func (EventTicketType) TableName() string { return "event_ticket_types" }

func (e *EventTicketType) BeforeCreate(tx *gorm.DB) error {
	if e.TicketTypeID == uuid.Nil {
		e.TicketTypeID = uuid.New()
	}
	return nil
}
