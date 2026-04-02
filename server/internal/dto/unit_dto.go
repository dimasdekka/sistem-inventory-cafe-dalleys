package dto

import "time"

type CreateUnitRequest struct {
	Name        string `json:"name" binding:"required"`
	Symbol      string `json:"symbol" binding:"required"`
	Description string `json:"description"`
}

type UpdateUnitRequest struct {
	Name        string `json:"name"`
	Symbol      string `json:"symbol"`
	Description string `json:"description"`
}

type UnitResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Symbol      string    `json:"symbol"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}
