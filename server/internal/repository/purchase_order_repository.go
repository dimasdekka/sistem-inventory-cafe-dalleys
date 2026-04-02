package repository

import (
	"caffe-dalley-backend/internal/domain"
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseOrderRepository interface {
	Create(ctx context.Context, po *domain.PurchaseOrder) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PurchaseOrder, error)
	GetByPONumber(ctx context.Context, poNumber string) (*domain.PurchaseOrder, error)
	GetAll(ctx context.Context) ([]*domain.PurchaseOrder, error)
	Update(ctx context.Context, po *domain.PurchaseOrder) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	FindBySupplierID(ctx context.Context, supplierID uuid.UUID) ([]*domain.PurchaseOrder, error)
}

type purchaseOrderRepository struct {
	db *gorm.DB
}

func NewPurchaseOrderRepository(db *gorm.DB) PurchaseOrderRepository {
	return &purchaseOrderRepository{db: db}
}

func (r *purchaseOrderRepository) Create(ctx context.Context, po *domain.PurchaseOrder) error {
	return r.db.WithContext(ctx).Create(po).Error
}

func (r *purchaseOrderRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.PurchaseOrder, error) {
	var po domain.PurchaseOrder
	err := r.db.WithContext(ctx).
		Preload("Items").
		Preload("Supplier").
		First(&po, "id = ?", id).Error
		
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("purchase order not found")
		}
		return nil, err
	}
	return &po, nil
}

func (r *purchaseOrderRepository) GetByPONumber(ctx context.Context, poNumber string) (*domain.PurchaseOrder, error) {
	var po domain.PurchaseOrder
	err := r.db.WithContext(ctx).
		Preload("Items").
		Preload("Supplier").
		First(&po, "po_number = ?", poNumber).Error
		
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("purchase order not found")
		}
		return nil, err
	}
	return &po, nil
}

func (r *purchaseOrderRepository) GetAll(ctx context.Context) ([]*domain.PurchaseOrder, error) {
	var pos []*domain.PurchaseOrder
	err := r.db.WithContext(ctx).
		Preload("Supplier").
		Preload("Items").
		Preload("Items.Product").
		Order("created_at DESC").
		Find(&pos).Error
		
	if err != nil {
		return nil, err
	}
	if len(pos) == 0 {
		return []*domain.PurchaseOrder{}, nil
	}
	return pos, nil
}

func (r *purchaseOrderRepository) Update(ctx context.Context, po *domain.PurchaseOrder) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update parent PO fields
		if err := tx.Save(po).Error; err != nil {
			return err
		}
		// Clear existing items
		if err := tx.Where("purchase_order_id = ?", po.ID).Delete(&domain.PurchaseOrderItem{}).Error; err != nil {
			return err
		}
		// Insert new items
		for _, item := range po.Items {
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *purchaseOrderRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	result := r.db.WithContext(ctx).Model(&domain.PurchaseOrder{}).Where("id = ?", id).Update("status", status)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("purchase order not found")
	}
	return nil
}

func (r *purchaseOrderRepository) FindBySupplierID(ctx context.Context, supplierID uuid.UUID) ([]*domain.PurchaseOrder, error) {
	var pos []*domain.PurchaseOrder
	err := r.db.WithContext(ctx).
		Preload("Supplier").
		Preload("Items").
		Preload("Items.Product").
		Where("supplier_id = ?", supplierID).
		Order("created_at DESC").
		Find(&pos).Error
		
	if err != nil {
		return nil, err
	}
	return pos, nil
}
