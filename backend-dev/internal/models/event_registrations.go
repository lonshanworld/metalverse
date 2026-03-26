package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventRegistration struct {
	RegistrationID uuid.UUID  `gorm:"column:registration_id;type:uuid;primaryKey" json:"registration_id"`
	EventID        uuid.UUID  `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	UserID         uuid.UUID  `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	TicketTypeID   *uuid.UUID `gorm:"column:ticket_type_id;type:uuid;index" json:"ticket_type_id"`
	Status         string     `gorm:"column:status;type:text" json:"status"` // REGISTERED, CANCELLED, ATTENDED, NO_SHOW
	RegisteredAt   time.Time  `gorm:"column:registered_at;type:timestamptz;autoCreateTime" json:"registered_at"`
	CancelledAt    *time.Time `gorm:"column:cancelled_at;type:timestamptz" json:"cancelled_at"`
	AttendedAt     *time.Time `gorm:"column:attended_at;type:timestamptz" json:"attended_at"`

	Event      *Event           `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	User       *User            `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	TicketType *EventTicketType `gorm:"foreignKey:TicketTypeID;references:TicketTypeID" json:"ticket_type,omitempty"`
}

func (EventRegistration) TableName() string { return "event_registrations" }

func (e *EventRegistration) BeforeCreate(tx *gorm.DB) error {
	if e.RegistrationID == uuid.Nil {
		e.RegistrationID = uuid.New()
	}
	return nil
}
