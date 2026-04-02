package service

import (
	"errors"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
)

type UnitService interface {
	CreateUnit(req dto.CreateUnitRequest) error
	GetUnits() ([]dto.UnitResponse, error)
	GetUnitByID(id string) (*dto.UnitResponse, error)
	UpdateUnit(id string, req dto.UpdateUnitRequest) error
	DeleteUnit(id string) error
}

type unitService struct {
	unitRepo domain.UnitRepository
}

func NewUnitService(unitRepo domain.UnitRepository) UnitService {
	return &unitService{unitRepo}
}

func (s *unitService) CreateUnit(req dto.CreateUnitRequest) error {
	u := &domain.Unit{
		Name:        req.Name,
		Symbol:      req.Symbol,
		Description: req.Description,
	}
	return s.unitRepo.Create(u)
}

func (s *unitService) GetUnits() ([]dto.UnitResponse, error) {
	units, err := s.unitRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var res []dto.UnitResponse
	for _, u := range units {
		res = append(res, dto.UnitResponse{
			ID:          u.ID,
			Name:        u.Name,
			Symbol:      u.Symbol,
			Description: u.Description,
			CreatedAt:   u.CreatedAt,
		})
	}
	return res, nil
}

func (s *unitService) GetUnitByID(id string) (*dto.UnitResponse, error) {
	u, err := s.unitRepo.FindByID(id)
	if err != nil || u == nil {
		return nil, errors.New("unit not found")
	}

	return &dto.UnitResponse{
		ID:          u.ID,
		Name:        u.Name,
		Symbol:      u.Symbol,
		Description: u.Description,
		CreatedAt:   u.CreatedAt,
	}, nil
}

func (s *unitService) UpdateUnit(id string, req dto.UpdateUnitRequest) error {
	u, err := s.unitRepo.FindByID(id)
	if err != nil || u == nil {
		return errors.New("unit not found")
	}

	if req.Name != "" {
		u.Name = req.Name
	}
	if req.Symbol != "" {
		u.Symbol = req.Symbol
	}
	if req.Description != "" {
		u.Description = req.Description
	}

	return s.unitRepo.Update(u)
}

func (s *unitService) DeleteUnit(id string) error {
	u, err := s.unitRepo.FindByID(id)
	if err != nil || u == nil {
		return errors.New("unit not found")
	}
	return s.unitRepo.Delete(id)
}
