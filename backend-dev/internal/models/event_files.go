package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventFile struct {
	EventFileID uuid.UUID `gorm:"column:event_file_id;type:uuid;primaryKey" json:"event_file_id"`
	EventID     uuid.UUID `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	FileID      uuid.UUID `gorm:"column:file_id;type:uuid;not null;index" json:"file_id"`
	Role        string    `gorm:"column:role;type:text;not null;default:gallery" json:"role"`
	Sequence    int       `gorm:"column:sequence;type:int;default:0" json:"sequence"`
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`

	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	File  *File  `gorm:"foreignKey:FileID;references:FileID" json:"file,omitempty"`
}

func (EventFile) TableName() string { return "event_files" }

func (ef *EventFile) BeforeCreate(tx *gorm.DB) error {
	if ef.EventFileID == uuid.Nil {
		ef.EventFileID = uuid.New()
	}
	return nil
}
