package domain

import (
	"time"

	"github.com/google/uuid"
)

type PurchaseOrder struct {
	ID         uuid.UUID           `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PONumber   string              `gorm:"type:varchar(50);uniqueIndex;not null" json:"po_number"`
	SupplierID uuid.UUID           `gorm:"type:uuid;index;not null" json:"supplier_id"`
	Status         string              `gorm:"type:varchar(20);default:'pending'" json:"status"` // draft, pending, completed, cancelled
	Notes          string              `gorm:"type:text" json:"notes"`
	TaxPercentage  float64             `gorm:"type:decimal(5,2);default:0" json:"tax_percentage"`
	Subtotal       float64             `gorm:"type:decimal(15,2);not null;default:0" json:"subtotal"`
	TaxAmount      float64             `gorm:"type:decimal(15,2);not null;default:0" json:"tax_amount"`
	Total          float64             `gorm:"type:decimal(15,2);not null;default:0" json:"total"`
	CreatedAt  time.Time           `json:"created_at"`
	UpdatedAt  time.Time           `json:"updated_at"`
	Items      []PurchaseOrderItem `gorm:"foreignKey:PurchaseOrderID" json:"items"` // Loaded relation
	Supplier   *Supplier           `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"` // Loaded relation
}

type PurchaseOrderItem struct {
	ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PurchaseOrderID uuid.UUID `gorm:"type:uuid;index;not null" json:"purchase_order_id"`
	ProductID       uuid.UUID `gorm:"type:uuid;index;not null" json:"product_id"`
	Quantity        float64   `gorm:"type:decimal(15,2);not null;default:0" json:"quantity"`
	UnitCost        float64   `gorm:"type:decimal(15,2);not null;default:0" json:"unit_cost"`
	TaxPercentage   float64   `gorm:"type:decimal(5,2);not null;default:0" json:"tax_percentage"`
	TaxAmount       float64   `gorm:"type:decimal(15,2);not null;default:0" json:"tax_amount"`
	Subtotal        float64   `gorm:"type:decimal(15,2);not null;default:0" json:"subtotal"`
	CreatedAt       time.Time `json:"created_at"`
	Product         *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"` // Loaded relation
}
