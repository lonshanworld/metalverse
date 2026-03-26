package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Location struct {
	LocationID uuid.UUID `gorm:"column:location_id;type:uuid;primaryKey" json:"location_id"`
	Name       string    `gorm:"column:name;type:text" json:"name"`
	Address1   string    `gorm:"column:address1;type:text" json:"address1"`
	Address2   string    `gorm:"column:address2;type:text" json:"address2"`
	District   string    `gorm:"column:district;type:text" json:"district"`
	Province   string    `gorm:"column:province;type:text" json:"province"`
	PostalCode string    `gorm:"column:postal_code;type:text" json:"postal_code"`
	Country    string    `gorm:"column:country;type:text" json:"country"`
	Latitude   float64   `gorm:"column:latitude;type:numeric" json:"latitude"`
	Longitude  float64   `gorm:"column:longitude;type:numeric" json:"longitude"`
	CreatedAt  time.Time `gorm:"column:created_at;type:timestamptz;autoCreateTime" json:"created_at"`
}

func (Location) TableName() string { return "locations" }

func (l *Location) BeforeCreate(tx *gorm.DB) error {
	if l.LocationID == uuid.Nil {
		l.LocationID = uuid.New()
	}
	return nil
}
