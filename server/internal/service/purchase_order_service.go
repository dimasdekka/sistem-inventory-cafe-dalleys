package service

import (
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/repository"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type PurchaseOrderService interface {
	Create(ctx context.Context, req *dto.CreatePurchaseOrderRequest) (*dto.PurchaseOrderResponse, error)
	GetByID(ctx context.Context, id uuid.UUID) (*dto.PurchaseOrderResponse, error)
	GetAll(ctx context.Context) ([]*dto.PurchaseOrderResponse, error)
	GetBySupplierID(ctx context.Context, supplierID uuid.UUID) ([]*dto.PurchaseOrderResponse, error)
	Update(ctx context.Context, id uuid.UUID, req *dto.UpdatePurchaseOrderRequest, userID string) (*dto.PurchaseOrderResponse, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, req *dto.UpdatePurchaseOrderStatusRequest, userID string) error
}

type purchaseOrderService struct {
	repo         repository.PurchaseOrderRepository
	inventorySvc InventoryService
	productRepo  domain.ProductRepository
}

func NewPurchaseOrderService(repo repository.PurchaseOrderRepository, inventorySvc InventoryService, productRepo domain.ProductRepository) PurchaseOrderService {
	return &purchaseOrderService{
		repo:         repo,
		inventorySvc: inventorySvc,
		productRepo:  productRepo,
	}
}

func (s *purchaseOrderService) Create(ctx context.Context, req *dto.CreatePurchaseOrderRequest) (*dto.PurchaseOrderResponse, error) {
	po := &domain.PurchaseOrder{
		ID:            uuid.New(),
		PONumber:      fmt.Sprintf("PO-%s-%s", time.Now().Format("20060102"), uuid.New().String()[:4]),
		SupplierID:    req.SupplierID,
		Status:        "pending",
		Notes:         req.Notes,
		TaxPercentage: req.TaxPercentage,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// useGlobalTax = true jika user set pajak global di form PO
	useGlobalTax := req.TaxPercentage > 0

	var subtotalTotal float64
	for _, itemReq := range req.Items {
		prod, err := s.productRepo.FindByID(itemReq.ProductID.String())
		var taxPercentage float64 = 0
		if !useGlobalTax && err == nil && prod != nil {
			taxPercentage = prod.TaxPercentage
		}

		subtotal := itemReq.Quantity * itemReq.UnitCost
		subtotalTotal += subtotal

		// Jika global tax, pajak per-item = 0 (akan dihitung di level PO)
		taxAmount := subtotal * (taxPercentage / 100)

		item := domain.PurchaseOrderItem{
			ID:              uuid.New(),
			PurchaseOrderID: po.ID,
			ProductID:       itemReq.ProductID,
			Quantity:        itemReq.Quantity,
			UnitCost:        itemReq.UnitCost,
			TaxPercentage:   taxPercentage,
			TaxAmount:       taxAmount,
			Subtotal:        subtotal,
			CreatedAt:       time.Now(),
		}
		po.Items = append(po.Items, item)
	}

	po.Subtotal = subtotalTotal
	if useGlobalTax {
		po.TaxAmount = subtotalTotal * (req.TaxPercentage / 100)
	} else {
		var totalTax float64
		for _, item := range po.Items {
			totalTax += item.TaxAmount
		}
		po.TaxAmount = totalTax
	}
	po.Total = po.Subtotal + po.TaxAmount

	if err := s.repo.Create(ctx, po); err != nil {
		return nil, err
	}

	return s.GetByID(ctx, po.ID)
}

func (s *purchaseOrderService) GetByID(ctx context.Context, id uuid.UUID) (*dto.PurchaseOrderResponse, error) {
	po, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	
	for i, item := range po.Items {
		if prod, err := s.productRepo.FindByID(item.ProductID.String()); err == nil {
			po.Items[i].Product = prod
		}
	}

	return mapPOToResponse(po), nil
}

func (s *purchaseOrderService) GetAll(ctx context.Context) ([]*dto.PurchaseOrderResponse, error) {
	pos, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var responses []*dto.PurchaseOrderResponse
	for _, po := range pos {
		// Populate products for each item
		for i, item := range po.Items {
			if prod, err := s.productRepo.FindByID(item.ProductID.String()); err == nil {
				po.Items[i].Product = prod
			}
		}
		responses = append(responses, mapPOToResponse(po))
	}

	if len(responses) == 0 {
		return []*dto.PurchaseOrderResponse{}, nil
	}
	return responses, nil
}

func (s *purchaseOrderService) GetBySupplierID(ctx context.Context, supplierID uuid.UUID) ([]*dto.PurchaseOrderResponse, error) {
	pos, err := s.repo.FindBySupplierID(ctx, supplierID)
	if err != nil {
		return nil, err
	}

	var responses []*dto.PurchaseOrderResponse
	for _, po := range pos {
		// Populate products for each item
		for i, item := range po.Items {
			if prod, err := s.productRepo.FindByID(item.ProductID.String()); err == nil {
				po.Items[i].Product = prod
			}
		}
		responses = append(responses, mapPOToResponse(po))
	}

	return responses, nil
}

func (s *purchaseOrderService) Update(ctx context.Context, id uuid.UUID, req *dto.UpdatePurchaseOrderRequest, userID string) (*dto.PurchaseOrderResponse, error) {
	po, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if po.Status != "pending" && po.Status != "draft" {
		return nil, errors.New("only pending or draft purchase orders can be updated")
	}

	po.SupplierID = req.SupplierID
	po.Notes = req.Notes
	po.TaxPercentage = req.TaxPercentage
	po.UpdatedAt = time.Now()

	useGlobalTax := req.TaxPercentage > 0

	var subtotalTotal float64
	var newItems []domain.PurchaseOrderItem
	for _, itemReq := range req.Items {
		prod, err := s.productRepo.FindByID(itemReq.ProductID.String())
		var taxPercentage float64 = 0
		if !useGlobalTax && err == nil && prod != nil {
			taxPercentage = prod.TaxPercentage
		}

		subtotal := itemReq.Quantity * itemReq.UnitCost
		subtotalTotal += subtotal

		taxAmount := subtotal * (taxPercentage / 100)

		item := domain.PurchaseOrderItem{
			ID:              uuid.New(),
			PurchaseOrderID: po.ID,
			ProductID:       itemReq.ProductID,
			Quantity:        itemReq.Quantity,
			UnitCost:        itemReq.UnitCost,
			TaxPercentage:   taxPercentage,
			TaxAmount:       taxAmount,
			Subtotal:        subtotal,
			CreatedAt:       time.Now(),
		}
		newItems = append(newItems, item)
	}
	po.Items = newItems
	po.Subtotal = subtotalTotal
	if useGlobalTax {
		po.TaxAmount = subtotalTotal * (req.TaxPercentage / 100)
	} else {
		var totalTax float64
		for _, item := range newItems {
			totalTax += item.TaxAmount
		}
		po.TaxAmount = totalTax
	}
	po.Total = po.Subtotal + po.TaxAmount

	if err := s.repo.Update(ctx, po); err != nil {
		return nil, err
	}

	return s.GetByID(ctx, po.ID)
}

func (s *purchaseOrderService) UpdateStatus(ctx context.Context, id uuid.UUID, req *dto.UpdatePurchaseOrderStatusRequest, userID string) error {
	po, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if po.Status == "completed" {
		return errors.New("cannot update a completed purchase order")
	}

	// Update the database status
	if err := s.repo.UpdateStatus(ctx, id, req.Status); err != nil {
		return err
	}

	// Trigger Inventory Stock In if completed - sekarang serta UnitCost untuk financial tracking
	if req.Status == "completed" {
		var items []dto.StockInItemRequest
		for _, item := range po.Items {
			items = append(items, dto.StockInItemRequest{
				ProductID: item.ProductID.String(),
				Quantity:  int(item.Quantity),
				UnitCost:  item.UnitCost,
			})
		}

		stockInReq := dto.StockInRequest{
			Items:       items,
			ReferenceNo: po.PONumber,
			Notes:       fmt.Sprintf("Penerimaan Barang PO: %s", po.PONumber),
		}

		if err := s.inventorySvc.StockIn(ctx, stockInReq, userID); err != nil {
			return fmt.Errorf("failed to process stock in for PO %s: %v", po.PONumber, err)
		}
	}

	return nil
}

func mapPOToResponse(po *domain.PurchaseOrder) *dto.PurchaseOrderResponse {
	res := &dto.PurchaseOrderResponse{
		ID:            po.ID,
		PONumber:      po.PONumber,
		SupplierID:    po.SupplierID,
		Status:        po.Status,
		Notes:         po.Notes,
		TaxPercentage: po.TaxPercentage,
		Subtotal:      po.Subtotal,
		TaxAmount:     po.TaxAmount,
		Total:         po.Total,
		CreatedAt:     po.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     po.UpdatedAt.Format(time.RFC3339),
	}

	if po.Supplier != nil {
		res.Supplier = &dto.SupplierResponse{
			ID:      po.Supplier.ID,
			Name:    po.Supplier.Name,
			Contact: po.Supplier.Contact,
			Email:   po.Supplier.Email,
			Phone:   po.Supplier.Phone,
			Address: po.Supplier.Address,
			Status:  po.Supplier.Status,
		}
	}

	var items []dto.PurchaseOrderItemResponse
	for _, item := range po.Items {
		itemRes := dto.PurchaseOrderItemResponse{
			ID:              item.ID,
			PurchaseOrderID: item.PurchaseOrderID,
			ProductID:       item.ProductID,
			Quantity:        item.Quantity,
			UnitCost:        item.UnitCost,
			TaxPercentage:   item.TaxPercentage,
			TaxAmount:       item.TaxAmount,
			Subtotal:        item.Subtotal,
			CreatedAt:       item.CreatedAt.Format(time.RFC3339),
		}
		if item.Product != nil {
			itemRes.Product = &dto.ProductResponse{
				ID:   item.Product.ID,
				Name: item.Product.Name,
				Code: item.Product.Code,
			}
		}
		items = append(items, itemRes)
	}
	res.Items = items

	return res
}
