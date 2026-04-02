package domain

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID          string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Code        string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Name        string         `gorm:"type:varchar(150);not null" json:"name"`
	Barcode     *string        `gorm:"type:varchar(255)" json:"barcode"`
	Description string         `gorm:"type:text" json:"description"`
	ImageURL    *string        `gorm:"type:text" json:"image_url"`
	Price          float64        `gorm:"type:decimal(15,2);not null;default:0" json:"price"`
	TaxPercentage  float64        `gorm:"type:decimal(5,2);not null;default:0" json:"tax_percentage"`
	MinStock       int            `gorm:"not null;default:0" json:"min_stock"`
	MaxStock    int            `gorm:"not null;default:0" json:"max_stock"`

	Stock       int            `gorm:"-" json:"stock"` // transient field from inventory

	CategoryID  string         `gorm:"type:uuid;index;not null" json:"category_id"`
	Category    Category       `gorm:"foreignKey:CategoryID" json:"category"`

	UnitID      string         `gorm:"type:uuid;index;not null" json:"unit_id"`
	Unit        Unit           `gorm:"foreignKey:UnitID" json:"unit"`

	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type ProductRepository interface {
	Create(product *Product) error
	FindAll() ([]*Product, error)
	FindByID(id string) (*Product, error)
	FindByCode(code string) (*Product, error)
	Update(product *Product) error
	Delete(id string) error
}
