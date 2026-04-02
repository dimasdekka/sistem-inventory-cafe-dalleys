package service

import (
	"context"
	"time"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/repository"
)

// DashboardKPIResponse holds all KPI stats for the dashboard
type DashboardKPIResponse struct {
	TotalProducts   int     `json:"total_products"`
	TotalStockValue float64 `json:"total_stock_value"`
	LowStockCount   int     `json:"low_stock_count"`
	CriticalCount   int     `json:"critical_count"`
	OutOfStockCount int     `json:"out_of_stock_count"`
	TodayIn         int     `json:"today_in"`
	TodayOut        int     `json:"today_out"`
}

// StockReportItem holds per-product stock data for reports
type StockReportItem struct {
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	SKU         string  `json:"sku"`
	Category    string  `json:"category"`
	Quantity    int     `json:"quantity"`
	Unit        string  `json:"unit"`
	Price       float64 `json:"price"`
	TotalValue  float64 `json:"total_value"`
	MinStock    int     `json:"min_stock"`
	Status      string  `json:"status"` // ok, low, critical, out
}

// MovementReportItem for movement (ledger) report
type MovementReportItem struct {
	ID          string    `json:"id"`
	Date        time.Time `json:"date"`
	ProductName string    `json:"product_name"`
	SKU         string    `json:"sku"`
	Type        string    `json:"type"`
	Quantity    int       `json:"quantity"`
	UnitCost    float64   `json:"unit_cost"`
	TotalValue  float64   `json:"total_value"`
	Notes       string    `json:"notes"`
	ReferenceNo string    `json:"reference_no"`
	CreatedBy   string    `json:"created_by"`
}

// PurchaseReportItem for purchase order report
type PurchaseReportItem struct {
	ID         string    `json:"id"`
	PONumber   string    `json:"po_number"`
	Supplier   string    `json:"supplier"`
	Total      float64   `json:"total"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	ItemCount  int       `json:"item_count"`
}

type ReportService interface {
	GetDashboardKPI(ctx context.Context) (*DashboardKPIResponse, error)
	GetStockReport(ctx context.Context) ([]StockReportItem, error)
	GetMovementReport(ctx context.Context) ([]MovementReportItem, error)
	GetPurchaseReport(ctx context.Context) ([]PurchaseReportItem, error)
}

type reportService struct {
	inventoryRepo     domain.InventoryRepository
	purchaseOrderRepo repository.PurchaseOrderRepository
	productRepo       domain.ProductRepository
}

func NewReportService(
	inventoryRepo domain.InventoryRepository,
	purchaseOrderRepo repository.PurchaseOrderRepository,
	productRepo domain.ProductRepository,
) ReportService {
	return &reportService{
		inventoryRepo:     inventoryRepo,
		purchaseOrderRepo: purchaseOrderRepo,
		productRepo:       productRepo,
	}
}

func (s *reportService) GetDashboardKPI(ctx context.Context) (*DashboardKPIResponse, error) {
	summaries, err := s.inventoryRepo.GetSummaries(ctx)
	if err != nil {
		return nil, err
	}

	ledgers, err := s.inventoryRepo.GetLedgers(ctx, "")
	if err != nil {
		return nil, err
	}

	products, err := s.productRepo.FindAll()
	if err != nil {
		return nil, err
	}

	kpi := &DashboardKPIResponse{}
	today := time.Now().Truncate(24 * time.Hour)

	for _, sum := range summaries {
		if sum.Product == nil {
			continue
		}

		kpi.TotalStockValue += float64(sum.Quantity) * sum.Product.Price

		if sum.Quantity <= 0 {
			kpi.OutOfStockCount++
		} else if sum.Product.MinStock > 0 && sum.Quantity <= sum.Product.MinStock/2 {
			kpi.CriticalCount++
		} else if sum.Product.MinStock > 0 && sum.Quantity < sum.Product.MinStock {
			kpi.LowStockCount++
		}
	}

	// Use actual total count instead of only those with stock
	kpi.TotalProducts = len(products)

	for _, l := range ledgers {
		if l.CreatedAt.After(today) {
			if l.Quantity > 0 {
				kpi.TodayIn++
			} else {
				kpi.TodayOut++
			}
		}
	}

	return kpi, nil
}

func (s *reportService) GetStockReport(ctx context.Context) ([]StockReportItem, error) {
	summaries, err := s.inventoryRepo.GetSummaries(ctx)
	if err != nil {
		return nil, err
	}

	var result []StockReportItem
	for _, sum := range summaries {
		if sum.Product == nil {
			continue
		}

		status := "ok"
		if sum.Quantity <= 0 {
			status = "out"
		} else if sum.Product.MinStock > 0 && sum.Quantity <= sum.Product.MinStock/2 {
			status = "critical"
		} else if sum.Product.MinStock > 0 && sum.Quantity < sum.Product.MinStock {
			status = "low"
		}

		result = append(result, StockReportItem{
			ProductID:   sum.ProductID,
			ProductName: sum.Product.Name,
			SKU:         sum.Product.Code,
			Category:    sum.Product.Category.Name,
			Quantity:    sum.Quantity,
			Unit:        sum.Product.Unit.Symbol,
			Price:       sum.Product.Price,
			TotalValue:  float64(sum.Quantity) * sum.Product.Price,
			MinStock:    sum.Product.MinStock,
			Status:      status,
		})
	}

	return result, nil
}

func (s *reportService) GetMovementReport(ctx context.Context) ([]MovementReportItem, error) {
	ledgers, err := s.inventoryRepo.GetLedgers(ctx, "")
	if err != nil {
		return nil, err
	}

	var result []MovementReportItem
	for _, l := range ledgers {
		productName, sku := "", ""
		if l.Product != nil {
			productName = l.Product.Name
			sku = l.Product.Code
		}

		createdBy := ""
		if l.CreatedBy != nil {
			createdBy = l.CreatedBy.Name
		}

		result = append(result, MovementReportItem{
			ID:          l.ID,
			Date:        l.CreatedAt,
			ProductName: productName,
			SKU:         sku,
			Type:        string(l.Type),
			Quantity:    l.Quantity,
			UnitCost:    l.UnitCost,
			TotalValue:  l.TotalValue,
			Notes:       l.Notes,
			ReferenceNo: l.ReferenceNo,
			CreatedBy:   createdBy,
		})
	}

	return result, nil
}

func (s *reportService) GetPurchaseReport(ctx context.Context) ([]PurchaseReportItem, error) {
	pos, err := s.purchaseOrderRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var result []PurchaseReportItem
	for _, po := range pos {
		supplierName := ""
		if po.Supplier != nil {
			supplierName = po.Supplier.Name
		}

		result = append(result, PurchaseReportItem{
			ID:        po.ID.String(),
			PONumber:  po.PONumber,
			Supplier:  supplierName,
			Total:     po.Total,
			Status:    po.Status,
			CreatedAt: po.CreatedAt,
			ItemCount: len(po.Items),
		})
	}

	return result, nil
}
