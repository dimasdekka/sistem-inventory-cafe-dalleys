package domain

import (
	"time"

	"gorm.io/gorm"
)

type ActivityLog struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    string         `gorm:"type:uuid;index;not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user"`
	Action    string         `gorm:"type:varchar(100);not null" json:"action"`
	Detail    string         `gorm:"type:text;not null" json:"detail"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type ActivityLogRepository interface {
	Create(log *ActivityLog) error
	FindAll(limit int) ([]*ActivityLog, error)
	FindByUserID(userID string, limit int) ([]*ActivityLog, error)
	Search(query string, limit int) ([]*ActivityLog, error)
}
