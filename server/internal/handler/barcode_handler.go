package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/pkg/barcode"
	"caffe-dalley-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type BarcodeHandler struct {
	productRepo   domain.ProductRepository
	inventoryRepo domain.InventoryRepository
}

func NewBarcodeHandler(productRepo domain.ProductRepository, inventoryRepo domain.InventoryRepository) *BarcodeHandler {
	return &BarcodeHandler{productRepo, inventoryRepo}
}

// Generate image barcode from product code/ID
func (h *BarcodeHandler) Generate(c *gin.Context) {
	id := c.Param("id")

	// Get product to get the code/SKU
	product, err := h.productRepo.FindByID(id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve product", err.Error())
		return
	}
	if product == nil {
		response.Error(c, http.StatusNotFound, "Product not found", nil)
		return
	}

	// Generate Barcode using product code
	pngData, err := barcode.GeneratePNG(product.Code, 300, 100)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate barcode", err.Error())
		return
	}

	// Send as image
	c.Data(http.StatusOK, "image/png", pngData)
}

type LookupRequest struct {
	Code string `json:"code" binding:"required"`
}

// Lookup product by its code
func (h *BarcodeHandler) Lookup(c *gin.Context) {
	var req LookupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	product, err := h.productRepo.FindByCode(req.Code)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Database error during lookup", err.Error())
		return
	}

	if product == nil {
		response.Error(c, http.StatusNotFound, "Product with this barcode not found", nil)
		return
	}

	// Get current stock from inventory summary (no transaction needed — read-only)
	stock := 0
	if h.inventoryRepo != nil {
		ctx := c.Request.Context()
		summaries, err := h.inventoryRepo.GetSummaries(ctx)
		if err == nil {
			for _, s := range summaries {
				if s.ProductID == product.ID {
					stock = s.Quantity
					break
				}
			}
		}
	}

	barcodeStr := ""
	if product.Barcode != nil {
		barcodeStr = *product.Barcode
	}

	response.Success(c, http.StatusOK, "Product found", gin.H{
		"id":             product.ID,
		"code":           product.Code,
		"barcode":        barcodeStr,
		"name":           product.Name,
		"price":          product.Price,
		"tax_percentage": product.TaxPercentage,
		"category":       product.Category.Name,
		"unit_symbol":    product.Unit.Symbol,
		"stock":          stock,
	})
}
