package repository

import (
	"errors"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
)

type unitRepository struct {
	db *gorm.DB
}

func NewUnitRepository(db *gorm.DB) domain.UnitRepository {
	return &unitRepository{db}
}

func (r *unitRepository) Create(unit *domain.Unit) error {
	return r.db.Create(unit).Error
}

func (r *unitRepository) FindAll() ([]*domain.Unit, error) {
	var units []*domain.Unit
	err := r.db.Order("name asc").Find(&units).Error
	return units, err
}

func (r *unitRepository) FindByID(id string) (*domain.Unit, error) {
	var unit domain.Unit
	err := r.db.First(&unit, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &unit, err
}

func (r *unitRepository) Update(unit *domain.Unit) error {
	return r.db.Save(unit).Error
}

func (r *unitRepository) Delete(id string) error {
	return r.db.Delete(&domain.Unit{}, "id = ?", id).Error
}
