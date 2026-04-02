package service

import (
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/pkg/logger"
)

type ActivityLogService interface {
	LogActivity(userID string, action string, detail string) error
	GetLatestLogs(limit int) ([]dto.ActivityLogResponse, error)
	GetUserLogs(userID string, limit int) ([]dto.ActivityLogResponse, error)
	SearchLogs(query string, limit int) ([]dto.ActivityLogResponse, error)
}

type activityLogService struct {
	logRepo domain.ActivityLogRepository
}

func NewActivityLogService(logRepo domain.ActivityLogRepository) ActivityLogService {
	return &activityLogService{logRepo}
}

func (s *activityLogService) LogActivity(userID string, action string, detail string) error {
	log := &domain.ActivityLog{
		UserID: userID,
		Action: action,
		Detail: detail,
	}

	if err := s.logRepo.Create(log); err != nil {
		logger.Log.Error().Err(err).Msg("Failed to log activity")
		return err
	}
	return nil
}

func (s *activityLogService) GetLatestLogs(limit int) ([]dto.ActivityLogResponse, error) {
	logs, err := s.logRepo.FindAll(limit)
	if err != nil {
		return nil, err
	}

	var responses []dto.ActivityLogResponse
	for _, l := range logs {
		responses = append(responses, dto.ActivityLogResponse{
			ID:        l.ID,
			UserID:    l.UserID,
			UserName:  l.User.Name,
			Action:    l.Action,
			Detail:    l.Detail,
			CreatedAt: l.CreatedAt,
		})
	}
	return responses, nil
}

func (s *activityLogService) GetUserLogs(userID string, limit int) ([]dto.ActivityLogResponse, error) {
	logs, err := s.logRepo.FindByUserID(userID, limit)
	if err != nil {
		return nil, err
	}

	var responses []dto.ActivityLogResponse
	for _, l := range logs {
		responses = append(responses, dto.ActivityLogResponse{
			ID:        l.ID,
			UserID:    l.UserID,
			UserName:  l.User.Name,
			Action:    l.Action,
			Detail:    l.Detail,
			CreatedAt: l.CreatedAt,
		})
	}
	return responses, nil
}

func (s *activityLogService) SearchLogs(query string, limit int) ([]dto.ActivityLogResponse, error) {
	logs, err := s.logRepo.Search(query, limit)
	if err != nil {
		return nil, err
	}

	var responses []dto.ActivityLogResponse
	for _, l := range logs {
		responses = append(responses, dto.ActivityLogResponse{
			ID:        l.ID,
			UserID:    l.UserID,
			UserName:  l.User.Name,
			Action:    l.Action,
			Detail:    l.Detail,
			CreatedAt: l.CreatedAt,
		})
	}
	return responses, nil
}
