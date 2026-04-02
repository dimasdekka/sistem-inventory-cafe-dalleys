package domain

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	ParentID    *string        `gorm:"type:uuid;index" json:"parent_id"`
	Parent      *Category      `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Subcategories []Category   `gorm:"foreignKey:ParentID" json:"subcategories,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type CategoryRepository interface {
	Create(category *Category) error
	FindAll() ([]*Category, error)
	FindByID(id string) (*Category, error)
	Update(category *Category) error
	Delete(id string) error
}
