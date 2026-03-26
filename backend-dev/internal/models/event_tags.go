package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tag struct {
	TagID uuid.UUID `gorm:"column:tag_id;type:uuid;primaryKey" json:"tag_id"`
	Name  string    `gorm:"column:name;type:text;not null;unique" json:"name"`
}

func (Tag) TableName() string { return "tags" }

func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.TagID == uuid.Nil {
		t.TagID = uuid.New()
	}
	return nil
}

type EventTag struct {
	EventID uuid.UUID `gorm:"column:event_id;type:uuid;primaryKey" json:"event_id"`
	TagID   uuid.UUID `gorm:"column:tag_id;type:uuid;primaryKey" json:"tag_id"`

	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
	Tag   *Tag   `gorm:"foreignKey:TagID;references:TagID" json:"tag,omitempty"`
}

func (EventTag) TableName() string { return "event_tags" }
