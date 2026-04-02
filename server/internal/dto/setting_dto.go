package dto

import "time"

type UpsertSettingRequest struct {
	Value map[string]interface{} `json:"value" binding:"required"`
}

type SettingResponse struct {
	ID        string                 `json:"id"`
	Value     map[string]interface{} `json:"value"`
	UpdatedAt time.Time              `json:"updated_at"`
	UpdatedBy *string                `json:"updated_by,omitempty"`
}
