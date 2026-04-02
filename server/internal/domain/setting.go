package domain

import (
	"time"

	"gorm.io/gorm"
)

type BusinessSetting struct {
	ID        string         `gorm:"type:varchar(50);primaryKey" json:"id"` // e.g. "general", "inventory", "printing"
	Value     string         `gorm:"type:jsonb;not null" json:"value"`      // Stored as JSON string
	UpdatedAt time.Time      `json:"updated_at"`
	UpdatedBy *string        `gorm:"type:uuid;index" json:"updated_by"`
	Updater   *User          `gorm:"foreignKey:UpdatedBy" json:"updater,omitempty"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type SettingRepository interface {
	Save(setting *BusinessSetting) error
	FindByID(id string) (*BusinessSetting, error)
	FindAll() ([]*BusinessSetting, error)
}
