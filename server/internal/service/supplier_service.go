package service

import (
	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/repository"
	"caffe-dalley-backend/pkg/upload"
	"context"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
)

type SupplierService interface {
	Create(ctx context.Context, req *dto.CreateSupplierRequest, file *multipart.FileHeader) (*dto.SupplierResponse, error)
	GetByID(ctx context.Context, id uuid.UUID) (*dto.SupplierResponse, error)
	GetAll(ctx context.Context) ([]*dto.SupplierResponse, error)
	Update(ctx context.Context, id uuid.UUID, req *dto.UpdateSupplierRequest, file *multipart.FileHeader) (*dto.SupplierResponse, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type supplierService struct {
	repo repository.SupplierRepository
	cfg  *config.Config
}

func NewSupplierService(repo repository.SupplierRepository, cfg *config.Config) SupplierService {
	return &supplierService{repo: repo, cfg: cfg}
}

func (s *supplierService) Create(ctx context.Context, req *dto.CreateSupplierRequest, file *multipart.FileHeader) (*dto.SupplierResponse, error) {
	supplierID := uuid.New()
	var imageURL *string

	if file != nil {
		objectName := "suppliers/" + supplierID.String() + "-" + file.Filename
		url, err := upload.UploadProductImage(ctx, s.cfg, file, objectName)
		if err != nil {
			return nil, err
		}
		imageURL = &url
	}

	supplier := &domain.Supplier{
		ID:        supplierID,
		Name:      req.Name,
		Contact:   req.Contact,
		Email:     req.Email,
		Phone:     req.Phone,
		Address:   req.Address,
		Status:    "active",
		ImageURL:  imageURL,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.Create(ctx, supplier); err != nil {
		return nil, err
	}

	return mapSupplierToResponse(supplier), nil
}

func (s *supplierService) GetByID(ctx context.Context, id uuid.UUID) (*dto.SupplierResponse, error) {
	supplier, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return mapSupplierToResponse(supplier), nil
}

func (s *supplierService) GetAll(ctx context.Context) ([]*dto.SupplierResponse, error) {
	suppliers, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var responses []*dto.SupplierResponse
	for _, supplier := range suppliers {
		responses = append(responses, mapSupplierToResponse(supplier))
	}

	if len(responses) == 0 {
		return []*dto.SupplierResponse{}, nil
	}

	return responses, nil
}

func (s *supplierService) Update(ctx context.Context, id uuid.UUID, req *dto.UpdateSupplierRequest, file *multipart.FileHeader) (*dto.SupplierResponse, error) {
	supplier, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	supplier.Name = req.Name
	supplier.Contact = req.Contact
	supplier.Email = req.Email
	supplier.Phone = req.Phone
	supplier.Address = req.Address
	supplier.Status = req.Status
	supplier.UpdatedAt = time.Now()

	if file != nil {
		objectName := "suppliers/" + supplier.ID.String() + "-" + file.Filename
		url, err := upload.UploadProductImage(ctx, s.cfg, file, objectName)
		if err != nil {
			return nil, err
		}
		supplier.ImageURL = &url
	}

	if err := s.repo.Update(ctx, supplier); err != nil {
		return nil, err
	}

	return mapSupplierToResponse(supplier), nil
}

func (s *supplierService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func mapSupplierToResponse(supplier *domain.Supplier) *dto.SupplierResponse {
	return &dto.SupplierResponse{
		ID:        supplier.ID,
		Name:      supplier.Name,
		Contact:   supplier.Contact,
		Email:     supplier.Email,
		Phone:     supplier.Phone,
		Address:   supplier.Address,
		Status:    supplier.Status,
		ImageURL:  supplier.ImageURL,
		CreatedAt: supplier.CreatedAt.Format(time.RFC3339),
		UpdatedAt: supplier.UpdatedAt.Format(time.RFC3339),
	}
}
