package service

import (
	"encoding/json"
	"errors"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
)

type SettingService interface {
	SaveSetting(id string, req dto.UpsertSettingRequest, userID string) error
	GetSettingByID(id string) (*dto.SettingResponse, error)
	GetAllSettings() ([]dto.SettingResponse, error)
}

type settingService struct {
	settingRepo domain.SettingRepository
}

func NewSettingService(settingRepo domain.SettingRepository) SettingService {
	return &settingService{settingRepo}
}

func (s *settingService) SaveSetting(id string, req dto.UpsertSettingRequest, userID string) error {
	jsonBytes, err := json.Marshal(req.Value)
	if err != nil {
		return errors.New("invalid JSON format for value")
	}

	setting := &domain.BusinessSetting{
		ID:        id,
		Value:     string(jsonBytes),
		UpdatedBy: &userID,
	}

	return s.settingRepo.Save(setting)
}

func (s *settingService) GetSettingByID(id string) (*dto.SettingResponse, error) {
	setting, err := s.settingRepo.FindByID(id)
	if err != nil || setting == nil {
		return nil, nil // Return nil if not found
	}

	var parsedValue map[string]interface{}
	_ = json.Unmarshal([]byte(setting.Value), &parsedValue)

	return &dto.SettingResponse{
		ID:        setting.ID,
		Value:     parsedValue,
		UpdatedAt: setting.UpdatedAt,
		UpdatedBy: setting.UpdatedBy,
	}, nil
}

func (s *settingService) GetAllSettings() ([]dto.SettingResponse, error) {
	settings, err := s.settingRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var res []dto.SettingResponse
	for _, s := range settings {
		var parsedValue map[string]interface{}
		_ = json.Unmarshal([]byte(s.Value), &parsedValue)
		
		res = append(res, dto.SettingResponse{
			ID:        s.ID,
			Value:     parsedValue,
			UpdatedAt: s.UpdatedAt,
			UpdatedBy: s.UpdatedBy,
		})
	}

	return res, nil
}
