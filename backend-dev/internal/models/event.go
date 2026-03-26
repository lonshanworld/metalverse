package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Event struct {
	EventID              uuid.UUID      `gorm:"column:event_id;type:uuid;primaryKey" json:"event_id"`
	OrgID                *uuid.UUID     `gorm:"column:org_id;type:uuid;index" json:"org_id"`
	LocationID           *uuid.UUID     `gorm:"column:location_id;type:uuid;index" json:"location_id"`
	Name                 string         `gorm:"column:name;type:text;not null" json:"name"`
	ShortDescription     string         `gorm:"column:short_description;type:text" json:"short_description"`
	Description          string         `gorm:"column:description;type:text" json:"description"`
	EventTypeRaw         string         `gorm:"column:event_type_raw;type:text" json:"event_type_raw"`
	EventTypeID          *uuid.UUID     `gorm:"column:event_type_id;type:uuid;index" json:"event_type_id"`
	FieldID              *uuid.UUID     `gorm:"column:field_id;type:uuid;index" json:"field_id"`
	ParticipationModeID  *uuid.UUID     `gorm:"column:participation_mode_id;type:uuid;index" json:"participation_mode_id"`
	CompetitionLevelID   *uuid.UUID     `gorm:"column:competition_level_id;type:uuid;index" json:"competition_level_id"`
	StartAt              time.Time      `gorm:"column:start_at;type:timestamptz;not null" json:"start_at"`
	EndAt                time.Time      `gorm:"column:end_at;type:timestamptz;not null" json:"end_at"`
	Timezone             string         `gorm:"column:timezone;type:text" json:"timezone"`
	RegistrationStartAt  *time.Time     `gorm:"column:registration_start_at;type:timestamptz" json:"registration_start_at"`
	RegistrationEndAt    *time.Time     `gorm:"column:registration_end_at;type:timestamptz" json:"registration_end_at"`
	RegistrationDeadline *time.Time     `gorm:"column:registration_deadline;type:timestamptz" json:"registration_deadline"`
	Capacity             int            `gorm:"column:capacity;type:int" json:"capacity"`
	RemainingSeats       int            `gorm:"column:remaining_seats;type:int" json:"remaining_seats"`
	HydrationPayload     string         `gorm:"column:hydration_payload;type:json" json:"hydration_payload"`
	CoverFileID          *uuid.UUID     `gorm:"column:cover_file_id;type:uuid;index" json:"cover_file_id"`
	IsSponsored          bool           `gorm:"column:is_sponsored;type:boolean;default:false" json:"is_sponsored"`
	Status               string         `gorm:"column:status;type:text" json:"status"` // PENDING, PUBLISHED, CANCELLED, COMPLETED
	CreatedBy            *uuid.UUID     `gorm:"column:created_by;type:uuid;index" json:"created_by"`
	CreatedAt            time.Time      `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time      `gorm:"column:updated_at;type:timestamptz;autoUpdateTime" json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	// Relationships
	Organization      *Organization      `gorm:"foreignKey:OrgID;references:OrgID" json:"organization,omitempty"`
	Location          *Location          `gorm:"foreignKey:LocationID;references:LocationID" json:"location,omitempty"`
	EventType         *EventType         `gorm:"foreignKey:EventTypeID;references:EventTypeID" json:"event_type,omitempty"`
	Field             *Field             `gorm:"foreignKey:FieldID;references:FieldID" json:"field,omitempty"`
	ParticipationMode *ParticipationMode `gorm:"foreignKey:ParticipationModeID;references:ParticipationModeID" json:"participation_mode,omitempty"`
	CompetitionLevel  *CompetitionLevel  `gorm:"foreignKey:CompetitionLevelID;references:CompetitionLevelID" json:"competition_level,omitempty"`
	CoverFile         *File              `gorm:"foreignKey:CoverFileID;references:FileID" json:"cover_file,omitempty"`
	Creator           *User              `gorm:"foreignKey:CreatedBy;references:UserID" json:"creator,omitempty"`
}

func (Event) TableName() string { return "events" }

func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.EventID == uuid.Nil {
		e.EventID = uuid.New()
	}
	return nil
}
