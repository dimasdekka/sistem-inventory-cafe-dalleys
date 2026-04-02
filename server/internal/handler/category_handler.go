package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService service.CategoryService
}

func NewCategoryHandler(categoryService service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService}
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.categoryService.CreateCategory(req); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to create category", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Category created successfully", nil)
}

func (h *CategoryHandler) FindAll(c *gin.Context) {
	categories, err := h.categoryService.GetCategories()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch categories", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Categories fetched successfully", categories)
}

func (h *CategoryHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	category, err := h.categoryService.GetCategoryByID(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Category not found", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Category fetched successfully", category)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.categoryService.UpdateCategory(id, req); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to update category", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Category updated successfully", nil)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.categoryService.DeleteCategory(id); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to delete category", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Category deleted successfully", nil)
}
