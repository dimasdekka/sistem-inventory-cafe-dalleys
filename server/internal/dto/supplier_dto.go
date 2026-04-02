package dto

import "github.com/google/uuid"

type CreateSupplierRequest struct {
	Name    string `json:"name" form:"name" binding:"required"`
	Contact string `json:"contact" form:"contact" binding:"required"`
	Email   string `json:"email" form:"email" binding:"required,email"`
	Phone   string `json:"phone" form:"phone" binding:"required"`
	Address string `json:"address" form:"address" binding:"required"`
}

type UpdateSupplierRequest struct {
	Name    string `json:"name" form:"name" binding:"required"`
	Contact string `json:"contact" form:"contact" binding:"required"`
	Email   string `json:"email" form:"email" binding:"required,email"`
	Phone   string `json:"phone" form:"phone" binding:"required"`
	Address string `json:"address" form:"address" binding:"required"`
	Status  string `json:"status" form:"status" binding:"required,oneof=active inactive"`
}

type SupplierResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Contact   string    `json:"contact"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	Status    string    `json:"status"`
	ImageURL  *string   `json:"image_url"`
	CreatedAt string    `json:"created_at"`
	UpdatedAt string    `json:"updated_at"`
}
