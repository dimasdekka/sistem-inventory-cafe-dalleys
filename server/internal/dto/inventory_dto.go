package dto

import "time"

type StockInRequest struct {
	Items       []StockInItemRequest `json:"items" binding:"required,min=1,dive"`
	ReferenceNo string               `json:"reference_no"`
	Notes       string               `json:"notes"`
}

type StockInItemRequest struct {
	ProductID string  `json:"product_id" binding:"required,uuid"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
	UnitCost  float64 `json:"unit_cost"`   // harga beli satuan SEBELUM pajak
	TaxPct    float64 `json:"tax_pct"`     // persentase pajak item ini (0–100)
}

type StockOutRequest struct {
	Items       []StockOutItemRequest `json:"items" binding:"required,min=1,dive"`
	ReferenceNo string                `json:"reference_no"`
	Notes       string                `json:"notes"`
}

type StockOutItemRequest struct {
	ProductID  string `json:"product_id" binding:"required,uuid"`
	Quantity   int    `json:"quantity" binding:"required,gt=0"`
}


type StockAdjustmentRequest struct {
	ProductID  string `json:"product_id" binding:"required,uuid"`
	Quantity   int    `json:"quantity" binding:"required"` // can be positive or negative
	Notes      string `json:"notes" binding:"required"`
}

type StockOpnameRequest struct {
	ProductID     string `json:"product_id" binding:"required,uuid"`
	ActualQuantity int   `json:"actual_quantity" binding:"required,min=0"`
	Notes         string `json:"notes"`
}

type StockSummaryResponse struct {
	ProductID  string `json:"product_id"`
	ProductName string `json:"product_name"`
	Quantity   int    `json:"quantity"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type StockLedgerResponse struct {
	ID                    string `json:"id"`
	Type                  string `json:"type"`
	ProductID             string  `json:"product_id"`
	ProductName           string  `json:"product_name"`
	Quantity              int     `json:"quantity"`
	UnitCost              float64 `json:"unit_cost"`
	TotalValue            float64 `json:"total_value"`
	Notes                 string  `json:"notes"`
	ReferenceNo           string  `json:"reference_no"`
	CreatedByID           string `json:"created_by_id"`
	CreatedByName         string `json:"created_by_name"`
	CreatedAt             time.Time `json:"created_at"`
}
