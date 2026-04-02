package dto

import "time"

type CreateProductRequest struct {
	Code        string  `form:"code" binding:"required"`
	Name        string  `form:"name" binding:"required"`
	Barcode     *string `form:"barcode"`
	Description   string  `form:"description"`
	Price         float64 `form:"price" binding:"min=0"`
	TaxPercentage float64 `form:"tax_percentage" binding:"min=0,max=100"`
	MinStock      int     `form:"min_stock" binding:"min=0"`
	MaxStock    int     `form:"max_stock" binding:"min=0,gtefield=MinStock"`
	CategoryID  string  `form:"category_id" binding:"required,uuid"`
	UnitID      string  `form:"unit_id" binding:"required,uuid"`
}

type UpdateProductRequest struct {
	Code        string  `form:"code"`
	Name        string  `form:"name"`
	Barcode       *string  `form:"barcode"`
	Description   string   `form:"description"`
	Price         *float64 `form:"price"`
	TaxPercentage *float64 `form:"tax_percentage" binding:"omitempty,min=0,max=100"`
	MinStock      *int     `form:"min_stock"`
	MaxStock    *int     `form:"max_stock"`
	CategoryID  string  `form:"category_id" binding:"omitempty,uuid"`
	UnitID      string  `form:"unit_id" binding:"omitempty,uuid"`
}

type ProductResponse struct {
	ID          string    `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Barcode     *string   `json:"barcode"`
	Description string    `json:"description"`
	ImageURL      *string   `json:"image_url"`
	Price         float64   `json:"price"`
	TaxPercentage float64   `json:"tax_percentage"`
	MinStock      int       `json:"min_stock"`
	MaxStock    int       `json:"max_stock"`
	Stock       int       `json:"stock"`
	
	Category    CategoryResponse `json:"category"`
	Unit        UnitResponse     `json:"unit"`

	CreatedAt   time.Time `json:"created_at"`
}
