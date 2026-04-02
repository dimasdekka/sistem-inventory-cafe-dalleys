package repository

import (
	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
)

type activityLogRepository struct {
	db *gorm.DB
}

func NewActivityLogRepository(db *gorm.DB) domain.ActivityLogRepository {
	return &activityLogRepository{db}
}

func (r *activityLogRepository) Create(log *domain.ActivityLog) error {
	return r.db.Create(log).Error
}

func (r *activityLogRepository) FindAll(limit int) ([]*domain.ActivityLog, error) {
	var logs []*domain.ActivityLog
	err := r.db.Preload("User").Order("created_at desc").Limit(limit).Find(&logs).Error
	return logs, err
}

func (r *activityLogRepository) FindByUserID(userID string, limit int) ([]*domain.ActivityLog, error) {
	var logs []*domain.ActivityLog
	err := r.db.Preload("User").Where("user_id = ?", userID).Order("created_at desc").Limit(limit).Find(&logs).Error
	return logs, err
}

func (r *activityLogRepository) Search(query string, limit int) ([]*domain.ActivityLog, error) {
	var logs []*domain.ActivityLog
	// Search in action or detail, case-insensitive. Since it's Postgres, ILIKE is preferred. 
	// To be safe across DBs, lowering both or using LIKE. For Gorm postgres, ILIKE works well.
	err := r.db.Preload("User").
		Where("action ILIKE ? OR detail ILIKE ?", "%"+query+"%", "%"+query+"%").
		Order("created_at desc").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}
