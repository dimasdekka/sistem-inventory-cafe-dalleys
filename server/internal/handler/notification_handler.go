package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	notificationService service.NotificationService
}

func NewNotificationHandler(service service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service}
}


// getNotifUserID extracts user ID string from context for notification handlers.
func getNotifUserID(c *gin.Context) string {
	userID, ok := getUserID(c)
	if !ok {
		return ""
	}
	return userID
}

// Create a new notification (Admin/System only)
func (h *NotificationHandler) Create(c *gin.Context) {
	var req dto.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	err := h.notificationService.CreateNotification(req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create notification", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Notification created successfully", nil)
}

// Get all notifications for the current user
func (h *NotificationHandler) FindMyNotifications(c *gin.Context) {
	userID := getNotifUserID(c)

	notifications, err := h.notificationService.GetNotifications(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch notifications", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Notifications retrieved successfully", notifications)
}

// Get unread count
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID := getNotifUserID(c)

	count, err := h.notificationService.GetUnreadCount(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get unread count", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Unread count retrieved successfully", gin.H{"count": count})
}

// Mark single notification as read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	id := c.Param("id")

	err := h.notificationService.MarkAsRead(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Notification not found or cannot be updated", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Notification marked as read", nil)
}

// Mark all as read
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := getNotifUserID(c)

	err := h.notificationService.MarkAllAsRead(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to mark all as read", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "All notifications marked as read", nil)
}

// Delete notification
func (h *NotificationHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.notificationService.DeleteNotification(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Failed to delete notification", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Notification deleted successfully", nil)
}
