package repository

import (
	"errors"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
)

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) domain.CategoryRepository {
	return &categoryRepository{db}
}

func (r *categoryRepository) Create(category *domain.Category) error {
	return r.db.Create(category).Error
}

func (r *categoryRepository) FindAll() ([]*domain.Category, error) {
	var categories []*domain.Category
	// Only load top level categories, preloading subcategories
	err := r.db.Where("parent_id IS NULL").Preload("Subcategories").Order("name asc").Find(&categories).Error
	return categories, err
}

func (r *categoryRepository) FindByID(id string) (*domain.Category, error) {
	var category domain.Category
	err := r.db.Preload("Subcategories").First(&category, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &category, err
}

func (r *categoryRepository) Update(category *domain.Category) error {
	return r.db.Save(category).Error
}

func (r *categoryRepository) Delete(id string) error {
	return r.db.Delete(&domain.Category{}, "id = ?", id).Error
}
