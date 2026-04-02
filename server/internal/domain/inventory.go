package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type MovementType string

const (
	MovementTypeIn         MovementType = "IN"
	MovementTypeOut        MovementType = "OUT"
	MovementTypeTransfer   MovementType = "TRANSFER"
	MovementTypeAdjustment MovementType = "ADJUSTMENT"
	MovementTypeOpname     MovementType = "OPNAME"
)

type StockLedger struct {
	ID                    string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID             string         `gorm:"type:uuid;index;not null" json:"product_id"`
	Product               *Product       `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	
	Type                  MovementType   `gorm:"type:varchar(20)" json:"type"`
	Quantity              int            `gorm:"not null" json:"quantity"` // positive for IN/Opname_up, negative for OUT/Opname_down
	UnitCost              float64        `gorm:"type:decimal(15,2);default:0" json:"unit_cost"`
	TotalValue            float64        `gorm:"type:decimal(15,2);default:0" json:"total_value"`
	Notes                 string         `gorm:"type:text" json:"notes"`
	ReferenceNo           string         `gorm:"type:varchar(50);index" json:"reference_no"`

	CreatedByID           string         `gorm:"type:uuid;index;not null" json:"created_by_id"`
	CreatedBy             *User          `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`

	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}

type StockSummary struct {
	ProductID  string    `gorm:"type:uuid;primaryKey" json:"product_id"`
	Product    *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	
	Quantity   int       `gorm:"not null;default:0" json:"quantity"` // current actual stock
	
	UpdatedAt  time.Time `json:"updated_at"`
}

type InventoryRepository interface {
	GetSummaryByProduct(ctx context.Context, tx *gorm.DB, productID string) (*StockSummary, error)
	GetSummaries(ctx context.Context) ([]*StockSummary, error)
	InsertLedger(ctx context.Context, tx *gorm.DB, ledger *StockLedger) error
	UpsertSummary(ctx context.Context, tx *gorm.DB, summary *StockSummary) error
	GetLedgers(ctx context.Context, productID string) ([]*StockLedger, error)
	CheckReferenceExists(ctx context.Context, refNo string) (bool, error)
}
