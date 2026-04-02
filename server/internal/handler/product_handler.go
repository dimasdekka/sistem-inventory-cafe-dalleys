package handler

import (
	"net/http"
	"strings"

	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService     service.ProductService
	activityLogService service.ActivityLogService
}

func NewProductHandler(productService service.ProductService, activityLogService service.ActivityLogService) *ProductHandler {
	return &ProductHandler{productService, activityLogService}
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	file, err := c.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		response.Error(c, http.StatusBadRequest, "Invalid file upload", err.Error())
		return
	}

	// Basic validation for magic bytes / content-type could be stricter here
	if file != nil {
		contentType := file.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			response.Error(c, http.StatusBadRequest, "File must be an image", nil)
			return
		}

		if file.Size > 2*1024*1024 { // 2MB
			response.Error(c, http.StatusBadRequest, "Image size exceeds 2MB", nil)
			return
		}
	}

	if err := h.productService.CreateProduct(c.Request.Context(), req, file); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create product", err.Error())
		return
	}

	if payload, exists := c.Get("authorization_payload"); exists {
		if authPayload, ok := payload.(*token.AuthPayload); ok {
			_ = h.activityLogService.LogActivity(authPayload.UserID, "CREATE_PRODUCT", "Menambahkan produk baru: "+req.Name)
		}
	}

	response.Success(c, http.StatusCreated, "Product created successfully", nil)
}

func (h *ProductHandler) FindAll(c *gin.Context) {
	products, err := h.productService.GetProducts()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch products", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Products fetched successfully", products)
}

func (h *ProductHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	p, err := h.productService.GetProductByID(id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Product not found", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Product fetched successfully", p)
}

func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	file, err := c.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		response.Error(c, http.StatusBadRequest, "Invalid file upload", err.Error())
		return
	}

	if file != nil {
		contentType := file.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			response.Error(c, http.StatusBadRequest, "File must be an image", nil)
			return
		}
		if file.Size > 2*1024*1024 { // 2MB
			response.Error(c, http.StatusBadRequest, "Image size exceeds 2MB", nil)
			return
		}
	}

	if err := h.productService.UpdateProduct(c.Request.Context(), id, req, file); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update product", err.Error())
		return
	}

	if payload, exists := c.Get("authorization_payload"); exists {
		if authPayload, ok := payload.(*token.AuthPayload); ok {
			_ = h.activityLogService.LogActivity(authPayload.UserID, "UPDATE_PRODUCT", "Memperbarui info produk: "+req.Name)
		}
	}

	response.Success(c, http.StatusOK, "Product updated successfully", nil)
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.productService.DeleteProduct(id); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to delete product", err.Error())
		return
	}

	if payload, exists := c.Get("authorization_payload"); exists {
		if authPayload, ok := payload.(*token.AuthPayload); ok {
			_ = h.activityLogService.LogActivity(authPayload.UserID, "DELETE_PRODUCT", "Menghapus produk dengan ID: "+id)
		}
	}

	response.Success(c, http.StatusOK, "Product deleted successfully", nil)
}
