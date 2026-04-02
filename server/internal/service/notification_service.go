package service

import (
	"errors"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"

	"github.com/google/uuid"
)

type NotificationService interface {
	CreateNotification(req dto.CreateNotificationRequest) error
	GetNotifications(userID string) ([]dto.NotificationResponse, error)
	GetUnreadCount(userID string) (int64, error)
	MarkAsRead(id string) error
	MarkAllAsRead(userID string) error
	DeleteNotification(id string) error
}

type notificationService struct {
	repo domain.NotificationRepository
}

func NewNotificationService(repo domain.NotificationRepository) NotificationService {
	return &notificationService{repo}
}

func (s *notificationService) CreateNotification(req dto.CreateNotificationRequest) error {
	notification := &domain.Notification{
		ID:      uuid.New().String(),
		UserID:  req.UserID,
		Title:   req.Title,
		Message: req.Message,
		Type:    req.Type,
		IsRead:  false,
	}

	return s.repo.Create(notification)
}

func (s *notificationService) GetNotifications(userID string) ([]dto.NotificationResponse, error) {
	notifications, err := s.repo.FindByUserID(userID, true)
	if err != nil {
		return nil, err
	}

	var res []dto.NotificationResponse
	for _, n := range notifications {
		res = append(res, dto.NotificationResponse{
			ID:        n.ID,
			UserID:    n.UserID,
			Title:     n.Title,
			Message:   n.Message,
			Type:      n.Type,
			IsRead:    n.IsRead,
			CreatedAt: n.CreatedAt,
		})
	}

	if res == nil {
		res = make([]dto.NotificationResponse, 0)
	}

	return res, nil
}

func (s *notificationService) GetUnreadCount(userID string) (int64, error) {
	return s.repo.FindUnreadCount(userID, true)
}

func (s *notificationService) MarkAsRead(id string) error {
	n, err := s.repo.FindByID(id)
	if err != nil || n == nil {
		return errors.New("notification not found")
	}

	n.IsRead = true
	return s.repo.Update(n)
}

func (s *notificationService) MarkAllAsRead(userID string) error {
	return s.repo.MarkAllAsRead(userID)
}

func (s *notificationService) DeleteNotification(id string) error {
	n, err := s.repo.FindByID(id)
	if err != nil || n == nil {
		return errors.New("notification not found")
	}

	return s.repo.Delete(id)
}
