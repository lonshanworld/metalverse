package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type File struct {
	FileID      uuid.UUID      `gorm:"column:file_id;type:uuid;primaryKey" json:"file_id"`
	OwnerUserID *uuid.UUID     `gorm:"column:owner_user_id;type:uuid;index" json:"owner_user_id"`
	FileName    string         `gorm:"column:file_name;type:varchar;not null" json:"file_name"`
	FileSize    int64          `gorm:"column:file_size;type:bigint" json:"file_size"`
	MimeType    string         `gorm:"column:mime_type;type:varchar" json:"mime_type"`
	StorageKey  string         `gorm:"column:storage_key;type:varchar;not null" json:"storage_key"`
	URL         string         `gorm:"column:url;type:varchar" json:"url"`
	CreatedAt   time.Time      `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Owner *User `gorm:"foreignKey:OwnerUserID;references:UserID" json:"owner,omitempty"`
}

func (File) TableName() string {
	return "files"
}

func (f *File) BeforeCreate(tx *gorm.DB) error {
	if f.FileID == uuid.Nil {
		f.FileID = uuid.New()
	}
	return nil
}
