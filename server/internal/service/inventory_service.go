package service

import (
	"context"
	"errors"
	"fmt"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/repository"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryService interface {
	StockIn(ctx context.Context, req dto.StockInRequest, userID string) error
	StockOut(ctx context.Context, req dto.StockOutRequest, userID string) error
	StockAdjustment(ctx context.Context, req dto.StockAdjustmentRequest, userID string) error
	StockOpname(ctx context.Context, req dto.StockOpnameRequest, userID string) error
	GetStockSummaries(ctx context.Context) ([]dto.StockSummaryResponse, error)
	GetStockLedgers(ctx context.Context, productID string) ([]dto.StockLedgerResponse, error)
}

type inventoryService struct {
	db                  *gorm.DB
	inventoryRepo       domain.InventoryRepository
	productRepo         domain.ProductRepository
	poRepo              repository.PurchaseOrderRepository
}

func NewInventoryService(db *gorm.DB, inventoryRepo domain.InventoryRepository, productRepo domain.ProductRepository, poRepo repository.PurchaseOrderRepository) InventoryService {
	return &inventoryService{db, inventoryRepo, productRepo, poRepo}
}

func (s *inventoryService) validateProduct(productID string) error {
	p, err := s.productRepo.FindByID(productID)
	if err != nil || p == nil {
		return errors.New("product not found")
	}
	return nil
}

func (s *inventoryService) StockIn(ctx context.Context, req dto.StockInRequest, userID string) error {
	// Validate all items first
	for _, item := range req.Items {
		if err := s.validateProduct(item.ProductID); err != nil {
			return err
		}
	}

	if req.ReferenceNo == "" {
		req.ReferenceNo = fmt.Sprintf("IN-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:4])
	} else {
		exists, err := s.inventoryRepo.CheckReferenceExists(ctx, req.ReferenceNo)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("nomor referensi sudah digunakan")
		}
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range req.Items {
			// 1. Calculate financial values (apply tax if provided)
			unitCostAfterTax := item.UnitCost
			if item.TaxPct > 0 {
				unitCostAfterTax = item.UnitCost * (1 + item.TaxPct/100)
			}
			totalValue := float64(item.Quantity) * unitCostAfterTax

			// Build notes with tax audit trail
			notes := req.Notes
			if item.TaxPct > 0 {
				notes = fmt.Sprintf("%s [Harga Beli: %.2f | Pajak: %.1f%% | Harga+Pajak: %.2f]", req.Notes, item.UnitCost, item.TaxPct, unitCostAfterTax)
			}

			// 2. Insert Ledger with financial data
			ledger := &domain.StockLedger{
				ProductID:   item.ProductID,
				Type:        domain.MovementTypeIn,
				Quantity:    item.Quantity,
				UnitCost:    unitCostAfterTax,
				TotalValue:  totalValue,
				ReferenceNo: req.ReferenceNo,
				Notes:       notes,
				CreatedByID: userID,
			}
			if err := s.inventoryRepo.InsertLedger(ctx, tx, ledger); err != nil {
				return err
			}

			// 2. Update Summary
			summary, err := s.inventoryRepo.GetSummaryByProduct(ctx, tx, item.ProductID)
			if err != nil {
				return err
			}
			
			newQty := item.Quantity
			if summary != nil {
				newQty += summary.Quantity
			}

			newSummary := &domain.StockSummary{
				ProductID:  item.ProductID,
				Quantity:   newQty,
			}
			if err := s.inventoryRepo.UpsertSummary(ctx, tx, newSummary); err != nil {
				return err
			}
		}

		// 3. Mark PO as Completed if ReferenceNo matches
		if req.ReferenceNo != "" && s.poRepo != nil {
			po, _ := s.poRepo.GetByPONumber(ctx, req.ReferenceNo)
			if po != nil && po.Status != "completed" && po.Status != "cancelled" {
				if err := s.poRepo.UpdateStatus(ctx, po.ID, "completed"); err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (s *inventoryService) StockOut(ctx context.Context, req dto.StockOutRequest, userID string) error {
	// Validate all items first
	for _, item := range req.Items {
		if err := s.validateProduct(item.ProductID); err != nil {
			return err
		}
	}

	if req.ReferenceNo == "" {
		req.ReferenceNo = fmt.Sprintf("OUT-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:4])
	} else {
		exists, err := s.inventoryRepo.CheckReferenceExists(ctx, req.ReferenceNo)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("nomor referensi sudah digunakan")
		}
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range req.Items {
			summary, err := s.inventoryRepo.GetSummaryByProduct(ctx, tx, item.ProductID)
			if err != nil {
				return err
			}

			if summary == nil || summary.Quantity < item.Quantity {
				return fmt.Errorf("insufficient stock: available %d, requested %d", 
					func() int { if summary == nil { return 0 } else { return summary.Quantity } }(), 
					item.Quantity)
			}

			p, err := s.productRepo.FindByID(item.ProductID)
			if err != nil {
				return err
			}

			unitCost := 0.0
			totalValue := 0.0
			if p != nil {
				unitCost = p.Price
				totalValue = float64(item.Quantity) * unitCost
			}

			ledger := &domain.StockLedger{
				ProductID:   item.ProductID,
				Type:        domain.MovementTypeOut,
				Quantity:    -item.Quantity,
				UnitCost:    unitCost,
				TotalValue:  totalValue,
				ReferenceNo: req.ReferenceNo,
				Notes:       req.Notes,
				CreatedByID: userID,
			}
			if err := s.inventoryRepo.InsertLedger(ctx, tx, ledger); err != nil {
				return err
			}

			newSummary := &domain.StockSummary{
				ProductID:  item.ProductID,
				Quantity:   summary.Quantity - item.Quantity,
			}
			if err := s.inventoryRepo.UpsertSummary(ctx, tx, newSummary); err != nil {
				return err
			}
		}
		return nil
	})
}


func (s *inventoryService) StockAdjustment(ctx context.Context, req dto.StockAdjustmentRequest, userID string) error {
	if req.Quantity == 0 {
		return errors.New("adjustment quantity cannot be zero")
	}
	if err := s.validateProduct(req.ProductID); err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		summary, err := s.inventoryRepo.GetSummaryByProduct(ctx, tx, req.ProductID)
		if err != nil {
			return err
		}
		
		currentQty := 0
		if summary != nil {
			currentQty = summary.Quantity
		}

		if currentQty+req.Quantity < 0 {
			return errors.New("adjustment would result in negative stock")
		}

		ledger := &domain.StockLedger{
			ProductID:   req.ProductID,
			Type:        domain.MovementTypeAdjustment,
			Quantity:    req.Quantity,
			Notes:       req.Notes,
			CreatedByID: userID,
		}
		if err := s.inventoryRepo.InsertLedger(ctx, tx, ledger); err != nil {
			return err
		}

		newSummary := &domain.StockSummary{
			ProductID:  req.ProductID,
			Quantity:   currentQty + req.Quantity,
		}
		return s.inventoryRepo.UpsertSummary(ctx, tx, newSummary)
	})
}

func (s *inventoryService) StockOpname(ctx context.Context, req dto.StockOpnameRequest, userID string) error {
	if err := s.validateProduct(req.ProductID); err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		summary, err := s.inventoryRepo.GetSummaryByProduct(ctx, tx, req.ProductID)
		if err != nil {
			return err
		}

		currentQty := 0
		if summary != nil {
			currentQty = summary.Quantity
		}

		if currentQty == req.ActualQuantity {
			// No difference, but maybe we still want to record the opname event?
			// Let's record it with 0 quantity just to show it was checked.
			ledger := &domain.StockLedger{
				ProductID:   req.ProductID,
				Type:        domain.MovementTypeOpname,
				Quantity:    0,
				Notes:       req.Notes + " (Matched)",
				CreatedByID: userID,
			}
			return s.inventoryRepo.InsertLedger(ctx, tx, ledger)
		}

		diff := req.ActualQuantity - currentQty

		ledger := &domain.StockLedger{
			ProductID:   req.ProductID,
			Type:        domain.MovementTypeOpname,
			Quantity:    diff,
			Notes:       req.Notes + fmt.Sprintf(" (Expected: %d, Actual: %d)", currentQty, req.ActualQuantity),
			CreatedByID: userID,
		}
		if err := s.inventoryRepo.InsertLedger(ctx, tx, ledger); err != nil {
			return err
		}

		newSummary := &domain.StockSummary{
			ProductID:  req.ProductID,
			Quantity:   req.ActualQuantity,
		}
		return s.inventoryRepo.UpsertSummary(ctx, tx, newSummary)
	})
}

func (s *inventoryService) GetStockSummaries(ctx context.Context) ([]dto.StockSummaryResponse, error) {
	summaries, err := s.inventoryRepo.GetSummaries(ctx)
	if err != nil {
		return nil, err
	}

	var res []dto.StockSummaryResponse
	for _, sum := range summaries {
		r := dto.StockSummaryResponse{
			ProductID:  sum.ProductID,
			Quantity:   sum.Quantity,
			UpdatedAt:  sum.UpdatedAt,
		}
		if sum.Product != nil {
			r.ProductName = sum.Product.Name
		}
		res = append(res, r)
	}
	return res, nil
}

func (s *inventoryService) GetStockLedgers(ctx context.Context, productID string) ([]dto.StockLedgerResponse, error) {
	ledgers, err := s.inventoryRepo.GetLedgers(ctx, productID)
	if err != nil {
		return nil, err
	}

	var res []dto.StockLedgerResponse
	for _, l := range ledgers {
		r := dto.StockLedgerResponse{
			ID:          l.ID,
			Type:        string(l.Type),
			ProductID:   l.ProductID,
			Quantity:    l.Quantity,
			Notes:       l.Notes,
			ReferenceNo: l.ReferenceNo,
			CreatedByID: l.CreatedByID,
			CreatedAt:   l.CreatedAt,
		}
		if l.Product != nil {
			r.ProductName = l.Product.Name
		}
		if l.CreatedBy != nil {
			r.CreatedByName = l.CreatedBy.Name
		}
		res = append(res, r)
	}
	return res, nil
}
