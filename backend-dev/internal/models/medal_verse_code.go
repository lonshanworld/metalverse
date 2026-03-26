package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MedalVerseCode struct {
	CodeID    uuid.UUID      `gorm:"column:code_id;type:uuid;primaryKey" json:"code_id"`
	Code      string         `gorm:"column:code;type:text;not null;unique" json:"code"`
	EventID   uuid.UUID      `gorm:"column:event_id;type:uuid;not null;index" json:"event_id"`
	MaxUses   int            `gorm:"column:max_uses;type:int" json:"max_uses"`
	UsedCount int            `gorm:"column:used_count;type:int;default:0" json:"used_count"`
	ExpiresAt *time.Time     `gorm:"column:expires_at;type:timestamptz" json:"expires_at"`
	IsActive  bool           `gorm:"column:is_active;type:boolean;default:true" json:"is_active"`
	CreatedAt time.Time      `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Event *Event `gorm:"foreignKey:EventID;references:EventID" json:"event,omitempty"`
}

func (MedalVerseCode) TableName() string { return "medal_verse_codes" }

func (m *MedalVerseCode) BeforeCreate(tx *gorm.DB) error {
	if m.CodeID == uuid.Nil {
		m.CodeID = uuid.New()
	}
	return nil
}
