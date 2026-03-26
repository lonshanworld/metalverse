package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrganizationMember struct {
	OrgMemberID uuid.UUID `gorm:"column:org_member_id;type:uuid;primaryKey" json:"org_member_id"`
	OrgID       uuid.UUID `gorm:"column:org_id;type:uuid;not null;index" json:"org_id"`
	UserID      uuid.UUID `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	Role        string    `gorm:"column:role;type:text" json:"role"` // OWNER, ADMIN, STAFF
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`

	Organization *Organization `gorm:"foreignKey:OrgID;references:OrgID" json:"organization,omitempty"`
	User         *User         `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
}

func (OrganizationMember) TableName() string { return "organization_members" }

func (om *OrganizationMember) BeforeCreate(tx *gorm.DB) error {
	if om.OrgMemberID == uuid.Nil {
		om.OrgMemberID = uuid.New()
	}
	return nil
}
