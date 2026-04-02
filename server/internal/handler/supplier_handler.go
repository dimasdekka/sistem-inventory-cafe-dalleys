package handler

import (
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SupplierHandler struct {
	service service.SupplierService
}

func NewSupplierHandler(service service.SupplierService) *SupplierHandler {
	return &SupplierHandler{service: service}
}

func (h *SupplierHandler) Create(c *gin.Context) {
	var req dto.CreateSupplierRequest
	if err := c.ShouldBind(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	file, err := c.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		response.Error(c, http.StatusBadRequest, "Invalid file upload", err.Error())
		return
	}

	res, err := h.service.Create(c.Request.Context(), &req, file)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create supplier", nil)
		return
	}

	response.Success(c, http.StatusCreated, "Supplier created successfully", res)
}

func (h *SupplierHandler) FindByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid supplier ID format", nil)
		return
	}

	res, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Supplier not found", nil)
		return
	}

	response.Success(c, http.StatusOK, "Supplier fetched successfully", res)
}

func (h *SupplierHandler) FindAll(c *gin.Context) {
	res, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch suppliers", nil)
		return
	}

	response.Success(c, http.StatusOK, "Suppliers fetched successfully", res)
}

func (h *SupplierHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid supplier ID format", nil)
		return
	}

	var req dto.UpdateSupplierRequest
	if err := c.ShouldBind(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	file, err := c.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		response.Error(c, http.StatusBadRequest, "Invalid file upload", err.Error())
		return
	}

	res, err := h.service.Update(c.Request.Context(), id, &req, file)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update supplier", nil)
		return
	}

	response.Success(c, http.StatusOK, "Supplier updated successfully", res)
}

func (h *SupplierHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid supplier ID format", nil)
		return
	}

	err = h.service.Delete(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete supplier", nil)
		return
	}

	response.Success(c, http.StatusOK, "Supplier deleted successfully", nil)
}
