package domain

import (
	"time"

	"gorm.io/gorm"
)

type Unit struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(50);not null" json:"name"`
	Symbol      string         `gorm:"type:varchar(10);not null" json:"symbol"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type UnitRepository interface {
	Create(unit *Unit) error
	FindAll() ([]*Unit, error)
	FindByID(id string) (*Unit, error)
	Update(unit *Unit) error
	Delete(id string) error
}
