package models

import (
	"time"

	"github.com/google/uuid"
)

type EventBookmark struct {
	UserID    uuid.UUID `gorm:"column:user_id;type:uuid;primaryKey" json:"user_id"`
	EventID   uuid.UUID `gorm:"column:event_id;type:uuid;primaryKey" json:"event_id"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`

	User  *User  `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
}

func (EventBookmark) TableName() string { return "event_bookmarks" }
