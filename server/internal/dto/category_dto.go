package dto

import "time"

type CreateCategoryRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	ParentID    *string `json:"parent_id"`
}

type UpdateCategoryRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	ParentID    *string `json:"parent_id"`
}

type CategoryResponse struct {
	ID            string             `json:"id"`
	Name          string             `json:"name"`
	Description   string             `json:"description"`
	ParentID      *string            `json:"parent_id,omitempty"`
	Subcategories []CategoryResponse `json:"subcategories,omitempty"`
	CreatedAt     time.Time          `json:"created_at"`
}
