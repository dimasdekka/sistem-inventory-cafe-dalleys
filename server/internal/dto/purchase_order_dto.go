package dto

import "github.com/google/uuid"

type CreatePurchaseOrderRequest struct {
	SupplierID    uuid.UUID                        `json:"supplier_id" binding:"required"`
	Notes         string                           `json:"notes"`
	TaxPercentage float64                          `json:"tax_percentage" binding:"gte=0,lte=100"`
	Items         []CreatePurchaseOrderItemRequest `json:"items" binding:"required,min=1,dive"`
}

type UpdatePurchaseOrderRequest struct {
	SupplierID    uuid.UUID                        `json:"supplier_id" binding:"required"`
	Notes         string                           `json:"notes"`
	TaxPercentage float64                          `json:"tax_percentage" binding:"gte=0,lte=100"`
	Items         []CreatePurchaseOrderItemRequest `json:"items" binding:"required,min=1,dive"`
}

type CreatePurchaseOrderItemRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	Quantity  float64   `json:"quantity" binding:"required,gt=0"`
	UnitCost  float64   `json:"unit_cost" binding:"gte=0"`
}

type UpdatePurchaseOrderStatusRequest struct {
	Status     string     `json:"status" binding:"required,oneof=draft pending completed cancelled"`
}

type PurchaseOrderResponse struct {
	ID         uuid.UUID                   `json:"id"`
	PONumber   string                      `json:"po_number"`
	SupplierID uuid.UUID                   `json:"supplier_id"`
	Supplier   *SupplierResponse           `json:"supplier,omitempty"`
	Status        string                      `json:"status"`
	Notes         string                      `json:"notes"`
	TaxPercentage float64                     `json:"tax_percentage"`
	Subtotal      float64                     `json:"subtotal"`
	TaxAmount     float64                     `json:"tax_amount"`
	Total         float64                     `json:"total"`
	Items         []PurchaseOrderItemResponse `json:"items"`
	CreatedAt  string                      `json:"created_at"`
	UpdatedAt  string                      `json:"updated_at"`
}

type PurchaseOrderItemResponse struct {
	ID              uuid.UUID        `json:"id"`
	PurchaseOrderID uuid.UUID        `json:"purchase_order_id"`
	ProductID       uuid.UUID        `json:"product_id"`
	Product         *ProductResponse `json:"product,omitempty"`
	Quantity        float64          `json:"quantity"`
	UnitCost        float64          `json:"unit_cost"`
	TaxPercentage   float64          `json:"tax_percentage"`
	TaxAmount       float64          `json:"tax_amount"`
	Subtotal        float64          `json:"subtotal"`
	CreatedAt       string           `json:"created_at"`
}
