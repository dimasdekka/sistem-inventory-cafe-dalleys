package repository

import (
	"errors"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type settingRepository struct {
	db *gorm.DB
}

func NewSettingRepository(db *gorm.DB) domain.SettingRepository {
	return &settingRepository{db}
}

func (r *settingRepository) Save(setting *domain.BusinessSetting) error {
	// Upsert query
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at", "updated_by"}),
	}).Create(setting).Error
}

func (r *settingRepository) FindByID(id string) (*domain.BusinessSetting, error) {
	var setting domain.BusinessSetting
	err := r.db.First(&setting, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &setting, err
}

func (r *settingRepository) FindAll() ([]*domain.BusinessSetting, error) {
	var settings []*domain.BusinessSetting
	err := r.db.Find(&settings).Error
	return settings, err
}
