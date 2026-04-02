package repository

import (
	"caffe-dalley-backend/internal/domain"
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SupplierRepository interface {
	Create(ctx context.Context, supplier *domain.Supplier) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Supplier, error)
	GetAll(ctx context.Context) ([]*domain.Supplier, error)
	Update(ctx context.Context, supplier *domain.Supplier) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) Create(ctx context.Context, supplier *domain.Supplier) error {
	return r.db.WithContext(ctx).Create(supplier).Error
}

func (r *supplierRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Supplier, error) {
	var supplier domain.Supplier
	err := r.db.WithContext(ctx).First(&supplier, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("supplier not found")
		}
		return nil, err
	}
	return &supplier, nil
}

func (r *supplierRepository) GetAll(ctx context.Context) ([]*domain.Supplier, error) {
	var suppliers []*domain.Supplier
	err := r.db.WithContext(ctx).Order("name ASC").Find(&suppliers).Error
	if err != nil {
		return nil, err
	}
	if len(suppliers) == 0 {
		return []*domain.Supplier{}, nil
	}
	return suppliers, nil
}

func (r *supplierRepository) Update(ctx context.Context, supplier *domain.Supplier) error {
	result := r.db.WithContext(ctx).Save(supplier)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("supplier not found")
	}
	return nil
}

func (r *supplierRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&domain.Supplier{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("supplier not found")
	}
	return nil
}
