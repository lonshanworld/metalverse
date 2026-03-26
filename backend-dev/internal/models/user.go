package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	UserID                     uuid.UUID      `gorm:"column:user_id;type:uuid;primaryKey" json:"user_id"`
	Email                      string         `gorm:"uniqueIndex;not null" json:"email"`
	Username                   *string        `gorm:"uniqueIndex" json:"username,omitempty"`
	Password                   *string        `json:"-"`
	FirstName                  *string        `json:"first_name,omitempty"`
	LastName                   *string        `json:"last_name,omitempty"`
	AvatarFileID               *uuid.UUID     `gorm:"column:avatar_file_id;type:uuid" json:"avatar_file_id"`
	IsActive                   bool           `gorm:"default:true" json:"is_active"`
	IsEmailVerified            bool           `gorm:"column:is_email_verified;default:false" json:"is_email_verified"`
	EmailVerificationToken     *string        `gorm:"column:email_verification_token;type:text;index" json:"-"`
	EmailVerificationExpiresAt *time.Time     `gorm:"column:email_verification_expires_at;type:timestamptz" json:"-"`
	CreatedAt                  time.Time      `gorm:"column:created_at;type:timestamp;autoCreateTime" json:"created_at"`
	UpdatedAt                  time.Time      `gorm:"column:updated_at;type:timestamp;autoUpdateTime" json:"updated_at"`
	DeletedAt                  gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Avatar *File `gorm:"foreignKey:AvatarFileID;references:FileID" json:"avatar,omitempty"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.UserID == uuid.Nil {
		u.UserID = uuid.New()
	}
	return nil
}
