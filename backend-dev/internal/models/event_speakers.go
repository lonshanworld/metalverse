package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Speaker struct {
	SpeakerID    uuid.UUID  `gorm:"column:speaker_id;type:uuid;primaryKey" json:"speaker_id"`
	DisplayName  string     `gorm:"column:display_name;type:text;not null" json:"display_name"`
	Title        string     `gorm:"column:title;type:text" json:"title"`
	Bio          string     `gorm:"column:bio;type:text" json:"bio"`
	AvatarFileID *uuid.UUID `gorm:"column:avatar_file_id;type:uuid" json:"avatar_file_id"`
	CreatedAt    time.Time  `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`

	Avatar *File `gorm:"foreignKey:AvatarFileID;references:FileID" json:"avatar,omitempty"`
}

func (Speaker) TableName() string { return "speakers" }

func (s *Speaker) BeforeCreate(tx *gorm.DB) error {
	if s.SpeakerID == uuid.Nil {
		s.SpeakerID = uuid.New()
	}
	return nil
}

type EventSpeaker struct {
	EventID   uuid.UUID `gorm:"column:event_id;type:uuid;primaryKey" json:"event_id"`
	SpeakerID uuid.UUID `gorm:"column:speaker_id;type:uuid;primaryKey" json:"speaker_id"`
	Role      string    `gorm:"column:role;type:text" json:"role"` // HOST, SPEAKER, PANELIST
	Position  int       `gorm:"column:position;type:int" json:"position"`

	Event   *Event   `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	Speaker *Speaker `gorm:"foreignKey:SpeakerID;references:SpeakerID" json:"speaker,omitempty"`
}

func (EventSpeaker) TableName() string { return "event_speakers" }
