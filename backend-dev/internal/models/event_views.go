package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventView struct {
	ViewID   uuid.UUID  `gorm:"column:view_id;type:uuid;primaryKey" json:"view_id"`
	UserID   *uuid.UUID `gorm:"column:user_id;type:uuid;index" json:"user_id"`
	EventID  uuid.UUID  `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	ViewedAt time.Time  `gorm:"column:viewed_at;type:timestamptz;autoCreateTime" json:"viewed_at"`

	User  *User  `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
}

func (EventView) TableName() string { return "event_views" }

func (e *EventView) BeforeCreate(tx *gorm.DB) error {
	if e.ViewID == uuid.Nil {
		e.ViewID = uuid.New()
	}
	return nil
}
