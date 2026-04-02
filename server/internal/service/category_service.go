package service

import (
	"errors"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
)

type CategoryService interface {
	CreateCategory(req dto.CreateCategoryRequest) error
	GetCategories() ([]dto.CategoryResponse, error)
	GetCategoryByID(id string) (*dto.CategoryResponse, error)
	UpdateCategory(id string, req dto.UpdateCategoryRequest) error
	DeleteCategory(id string) error
}

type categoryService struct {
	categoryRepo domain.CategoryRepository
}

func NewCategoryService(categoryRepo domain.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo}
}

func (s *categoryService) CreateCategory(req dto.CreateCategoryRequest) error {
	cat := &domain.Category{
		Name:        req.Name,
		Description: req.Description,
		ParentID:    req.ParentID,
	}

	if req.ParentID != nil && *req.ParentID != "" {
		parent, _ := s.categoryRepo.FindByID(*req.ParentID)
		if parent == nil {
			return errors.New("parent category not found")
		}
	} else {
		cat.ParentID = nil
	}

	return s.categoryRepo.Create(cat)
}

func mapCategoryParamToDTO(c domain.Category) dto.CategoryResponse {
	res := dto.CategoryResponse{
		ID:          c.ID,
		Name:        c.Name,
		Description: c.Description,
		ParentID:    c.ParentID,
		CreatedAt:   c.CreatedAt,
	}
	for _, sub := range c.Subcategories {
		res.Subcategories = append(res.Subcategories, mapCategoryParamToDTO(sub))
	}
	return res
}

func (s *categoryService) GetCategories() ([]dto.CategoryResponse, error) {
	categories, err := s.categoryRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var res []dto.CategoryResponse
	for _, c := range categories {
		res = append(res, mapCategoryParamToDTO(*c))
	}
	return res, nil
}

func (s *categoryService) GetCategoryByID(id string) (*dto.CategoryResponse, error) {
	c, err := s.categoryRepo.FindByID(id)
	if err != nil || c == nil {
		return nil, errors.New("category not found")
	}

	mapped := mapCategoryParamToDTO(*c)
	return &mapped, nil
}

func (s *categoryService) UpdateCategory(id string, req dto.UpdateCategoryRequest) error {
	cat, err := s.categoryRepo.FindByID(id)
	if err != nil || cat == nil {
		return errors.New("category not found")
	}

	if req.Name != "" {
		cat.Name = req.Name
	}
	if req.Description != "" {
		cat.Description = req.Description
	}
	if req.ParentID != nil {
		if *req.ParentID == "" {
			cat.ParentID = nil
		} else {
			if *req.ParentID == id {
				return errors.New("category cannot be its own parent")
			}
			parent, _ := s.categoryRepo.FindByID(*req.ParentID)
			if parent == nil {
				return errors.New("parent category not found")
			}
			cat.ParentID = req.ParentID
		}
	}

	return s.categoryRepo.Update(cat)
}

func (s *categoryService) DeleteCategory(id string) error {
	cat, err := s.categoryRepo.FindByID(id)
	if err != nil || cat == nil {
		return errors.New("category not found")
	}
	
	if len(cat.Subcategories) > 0 {
		return errors.New("cannot delete category containing subcategories")
	}

	return s.categoryRepo.Delete(id)
}
