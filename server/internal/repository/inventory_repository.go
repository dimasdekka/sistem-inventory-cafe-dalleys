package repository

import (
	"context"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) domain.InventoryRepository {
	return &inventoryRepository{db}
}

func (r *inventoryRepository) GetSummaryByProduct(ctx context.Context, tx *gorm.DB, productID string) (*domain.StockSummary, error) {
	db := r.db
	if tx != nil {
		db = tx
	}

	var summary domain.StockSummary
	// Use clause.Locking{Strength: "UPDATE"} to prevent concurrent race conditions
	err := db.WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&summary, "product_id = ?", productID).Error
		
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // Not found is valid (0 stock)
		}
		return nil, err
	}
	return &summary, nil
}

func (r *inventoryRepository) GetSummaries(ctx context.Context) ([]*domain.StockSummary, error) {
	var summaries []*domain.StockSummary
	err := r.db.WithContext(ctx).
		Preload("Product.Category").
		Preload("Product.Unit").
		Find(&summaries).Error
	return summaries, err
}

func (r *inventoryRepository) InsertLedger(ctx context.Context, tx *gorm.DB, ledger *domain.StockLedger) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(ledger).Error
}

func (r *inventoryRepository) UpsertSummary(ctx context.Context, tx *gorm.DB, summary *domain.StockSummary) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	// Upsert logic
	return db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "product_id"}}, // primary keys composite
		DoUpdates: clause.AssignmentColumns([]string{"quantity", "updated_at"}),
	}).Create(summary).Error
}

func (r *inventoryRepository) GetLedgers(ctx context.Context, productID string) ([]*domain.StockLedger, error) {
	var ledgers []*domain.StockLedger
	query := r.db.WithContext(ctx).
		Preload("Product.Category").
		Preload("Product.Unit").
		Preload("CreatedBy").
		Order("created_at desc")

	if productID != "" {
		query = query.Where("product_id = ?", productID)
	}

	err := query.Find(&ledgers).Error
	return ledgers, err
}

func (r *inventoryRepository) CheckReferenceExists(ctx context.Context, refNo string) (bool, error) {
	if refNo == "" {
		return false, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.StockLedger{}).Where("reference_no = ?", refNo).Count(&count).Error
	return count > 0, err
}
