package repository

import (
	"errors"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
)

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) domain.ProductRepository {
	return &productRepository{db}
}

func (r *productRepository) Create(product *domain.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) FindAll() ([]*domain.Product, error) {
	var products []*domain.Product
	err := r.db.Preload("Category").Preload("Unit").Order("created_at desc").Find(&products).Error
	return products, err
}

func (r *productRepository) FindByID(id string) (*domain.Product, error) {
	var product domain.Product
	err := r.db.Preload("Category").Preload("Unit").First(&product, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &product, err
}

func (r *productRepository) FindByCode(code string) (*domain.Product, error) {
	var product domain.Product
	err := r.db.Preload("Category").Preload("Unit").First(&product, "code = ?", code).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &product, err
}

func (r *productRepository) Update(product *domain.Product) error {
	return r.db.Select("Code", "Name", "Barcode", "Description", "ImageURL", "Price", "MinStock", "MaxStock", "CategoryID", "UnitID").Save(product).Error
}

func (r *productRepository) Delete(id string) error {
	return r.db.Delete(&domain.Product{}, "id = ?", id).Error
}
