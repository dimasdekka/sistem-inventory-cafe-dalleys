package repository

import (
	"errors"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
)

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) domain.NotificationRepository {
	return &notificationRepository{db}
}

func (r *notificationRepository) Create(notification *domain.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepository) FindByUserID(userID string, includeBroadcast bool) ([]*domain.Notification, error) {
	var notifications []*domain.Notification

	query := r.db.Order("created_at desc")
	if includeBroadcast {
		// Include specific user OR broadcast (user_id is null)
		query = query.Where("user_id = ? OR user_id IS NULL", userID)
	} else {
		query = query.Where("user_id = ?", userID)
	}

	err := query.Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) FindUnreadCount(userID string, includeBroadcast bool) (int64, error) {
	var count int64
	query := r.db.Model(&domain.Notification{}).Where("is_read = ?", false)

	if includeBroadcast {
		query = query.Where("user_id = ? OR user_id IS NULL", userID)
	} else {
		query = query.Where("user_id = ?", userID)
	}

	err := query.Count(&count).Error
	return count, err
}

func (r *notificationRepository) FindByID(id string) (*domain.Notification, error) {
	var notification domain.Notification
	err := r.db.First(&notification, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil // Not found
	}
	return &notification, err
}

func (r *notificationRepository) Update(notification *domain.Notification) error {
	return r.db.Save(notification).Error
}

func (r *notificationRepository) Delete(id string) error {
	return r.db.Delete(&domain.Notification{}, "id = ?", id).Error
}

func (r *notificationRepository) MarkAllAsRead(userID string) error {
	return r.db.Model(&domain.Notification{}).
		Where("user_id = ? OR user_id IS NULL", userID).
		Where("is_read = ?", false).
		Update("is_read", true).Error
}
