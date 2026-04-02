package domain

import (
	"time"

	"gorm.io/gorm"
)

type Notification struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    *string        `gorm:"type:uuid;index" json:"user_id"` // Jika null, berarti broadcast untuk semua / admin
	Title     string         `gorm:"type:varchar(255);not null" json:"title"`
	Message   string         `gorm:"type:text;not null" json:"message"`
	Type      string         `gorm:"type:varchar(50);not null" json:"type"` // e.g., "info", "warning", "success", "error"
	IsRead    bool           `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type NotificationRepository interface {
	Create(notification *Notification) error
	FindByUserID(userID string, includeBroadcast bool) ([]*Notification, error)
	FindUnreadCount(userID string, includeBroadcast bool) (int64, error)
	FindByID(id string) (*Notification, error)
	Update(notification *Notification) error
	Delete(id string) error
	MarkAllAsRead(userID string) error
}
