package service

import (
	"context"
	"errors"
	"mime/multipart"

	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/pkg/upload"

	"github.com/google/uuid"
)

type ProductService interface {
	CreateProduct(ctx context.Context, req dto.CreateProductRequest, file *multipart.FileHeader) error
	GetProducts() ([]dto.ProductResponse, error)
	GetProductByID(id string) (*dto.ProductResponse, error)
	UpdateProduct(ctx context.Context, id string, req dto.UpdateProductRequest, file *multipart.FileHeader) error
	DeleteProduct(id string) error
}

type productService struct {
	productRepo   domain.ProductRepository
	categoryRepo  domain.CategoryRepository
	unitRepo      domain.UnitRepository
	inventoryRepo domain.InventoryRepository
	cfg           *config.Config
}

func NewProductService(
	productRepo domain.ProductRepository,
	categoryRepo domain.CategoryRepository,
	unitRepo domain.UnitRepository,
	inventoryRepo domain.InventoryRepository,
	cfg *config.Config,
) ProductService {
	return &productService{productRepo, categoryRepo, unitRepo, inventoryRepo, cfg}
}

func (s *productService) CreateProduct(ctx context.Context, req dto.CreateProductRequest, file *multipart.FileHeader) error {
	// Generate unique id for file
	productID := uuid.New().String()
	var imageURL *string

	if file != nil {
		objectName := "products/" + productID + "-" + file.Filename
		url, err := upload.UploadProductImage(ctx, s.cfg, file, objectName)
		if err != nil {
			return err
		}
		imageURL = &url
	}

	p := &domain.Product{
		ID:          productID,
		Code:        req.Code,
		Name:        req.Name,
		Barcode:     req.Barcode,
		Description: req.Description,
		Price:       req.Price,
		TaxPercentage: req.TaxPercentage,
		MinStock:    req.MinStock,
		MaxStock:    req.MaxStock,
		CategoryID:  req.CategoryID,
		UnitID:      req.UnitID,
		ImageURL:    imageURL,
	}

	return s.productRepo.Create(p)
}

func mapProductToDTO(p *domain.Product) dto.ProductResponse {
	return dto.ProductResponse{
		ID:          p.ID,
		Code:        p.Code,
		Name:        p.Name,
		Barcode:     p.Barcode,
		Description: p.Description,
		ImageURL:    p.ImageURL,
		Price:       p.Price,
		TaxPercentage: p.TaxPercentage,
		MinStock:    p.MinStock,
		MaxStock:    p.MaxStock,
		Stock:       p.Stock,
		CreatedAt:   p.CreatedAt,
		Category: dto.CategoryResponse{
			ID:          p.Category.ID,
			Name:        p.Category.Name,
			Description: p.Category.Description,
		},
		Unit: dto.UnitResponse{
			ID:          p.Unit.ID,
			Name:        p.Unit.Name,
			Symbol:      p.Unit.Symbol,
		},
	}
}

func (s *productService) GetProducts() ([]dto.ProductResponse, error) {
	products, err := s.productRepo.FindAll()
	if err != nil {
		return nil, err
	}

	summaries, _ := s.inventoryRepo.GetSummaries(context.Background())
	stockMap := make(map[string]int)
	for _, sum := range summaries {
		stockMap[sum.ProductID] += sum.Quantity
	}

	res := make([]dto.ProductResponse, len(products))
	for i, p := range products {
		p.Stock = stockMap[p.ID]
		res[i] = mapProductToDTO(p)
	}
	return res, nil
}

func (s *productService) GetProductByID(id string) (*dto.ProductResponse, error) {
	p, err := s.productRepo.FindByID(id)
	if err != nil || p == nil {
		return nil, errors.New("product not found")
	}

	summaries, _ := s.inventoryRepo.GetSummaries(context.Background())
	totalStock := 0
	for _, sum := range summaries {
		if sum.ProductID == id {
			totalStock += sum.Quantity
		}
	}
	p.Stock = totalStock

	res := mapProductToDTO(p)
	return &res, nil
}

func (s *productService) UpdateProduct(ctx context.Context, id string, req dto.UpdateProductRequest, file *multipart.FileHeader) error {
	p, err := s.productRepo.FindByID(id)
	if err != nil || p == nil {
		return errors.New("product not found")
	}

	if req.Code != "" {
		p.Code = req.Code
	}
	if req.Name != "" {
		p.Name = req.Name
	}
	if req.Barcode != nil {
		p.Barcode = req.Barcode
	}
	if req.Description != "" {
		p.Description = req.Description
	}
	if req.Price != nil {
		p.Price = *req.Price
	}
	if req.TaxPercentage != nil {
		p.TaxPercentage = *req.TaxPercentage
	}
	if req.MinStock != nil {
		p.MinStock = *req.MinStock
	}
	if req.MaxStock != nil {
		p.MaxStock = *req.MaxStock
	}
	if req.CategoryID != "" {
		p.CategoryID = req.CategoryID
	}
	if req.UnitID != "" {
		p.UnitID = req.UnitID
	}

	if file != nil {
		objectName := "products/" + p.ID + "-" + file.Filename
		url, err := upload.UploadProductImage(ctx, s.cfg, file, objectName)
		if err != nil {
			return err
		}
		p.ImageURL = &url
	}

	return s.productRepo.Update(p)
}

func (s *productService) DeleteProduct(id string) error {
	p, err := s.productRepo.FindByID(id)
	if err != nil || p == nil {
		return errors.New("product not found")
	}
	return s.productRepo.Delete(id)
}
