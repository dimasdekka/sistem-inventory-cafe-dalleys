package dto

import "time"

type NotificationResponse struct {
	ID        string    `json:"id"`
	UserID    *string   `json:"user_id,omitempty"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateNotificationRequest struct {
	UserID  *string `json:"user_id" binding:"omitempty,uuid"`
	Title   string  `json:"title" binding:"required,max=255"`
	Message string  `json:"message" binding:"required"`
	Type    string  `json:"type" binding:"required,oneof=info warning success error"`
}
