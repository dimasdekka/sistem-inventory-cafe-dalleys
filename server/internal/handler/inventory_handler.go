package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	inventoryService   service.InventoryService
	activityLogService service.ActivityLogService
}

func NewInventoryHandler(inventoryService service.InventoryService, activityLogService service.ActivityLogService) *InventoryHandler {
	return &InventoryHandler{inventoryService, activityLogService}
}

func getUserID(c *gin.Context) (string, bool) {
	payload, exists := c.Get("authorization_payload")
	if !exists {
		return "", false
	}
	authPayload := payload.(*token.AuthPayload)
	return authPayload.UserID, true
}

func (h *InventoryHandler) StockIn(c *gin.Context) {
	var req dto.StockInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	if err := h.inventoryService.StockIn(c.Request.Context(), req, userID); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to record stock in", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(userID, "STOCK_IN", "Mencatat stok masuk. Referensi: "+req.ReferenceNo)

	response.Success(c, http.StatusOK, "Stock in recorded successfully", nil)
}

func (h *InventoryHandler) StockOut(c *gin.Context) {
	var req dto.StockOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	if err := h.inventoryService.StockOut(c.Request.Context(), req, userID); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to record stock out", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(userID, "STOCK_OUT", "Mencatat pengeluaran stok. Referensi: "+req.ReferenceNo)

	response.Success(c, http.StatusOK, "Stock out recorded successfully", nil)
}


func (h *InventoryHandler) StockAdjustment(c *gin.Context) {
	var req dto.StockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	if err := h.inventoryService.StockAdjustment(c.Request.Context(), req, userID); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to adjust stock", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(userID, "STOCK_ADJUSTMENT", "Melakukan penyesuaian stok produk. Catatan: "+req.Notes)

	response.Success(c, http.StatusOK, "Stock adjusted successfully", nil)
}

func (h *InventoryHandler) StockOpname(c *gin.Context) {
	var req dto.StockOpnameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	if err := h.inventoryService.StockOpname(c.Request.Context(), req, userID); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to opname stock", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(userID, "STOCK_OPNAME", "Mencatat hasil opname stok. Catatan: "+req.Notes)

	response.Success(c, http.StatusOK, "Stock opname recorded successfully", nil)
}

func (h *InventoryHandler) GetSummaries(c *gin.Context) {
	summaries, err := h.inventoryService.GetStockSummaries(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get stock summaries", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Stock summaries fetched successfully", summaries)
}

func (h *InventoryHandler) GetLedgers(c *gin.Context) {
	productID := c.Query("product_id")
	ledgers, err := h.inventoryService.GetStockLedgers(c.Request.Context(), productID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get stock ledgers", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Stock ledgers fetched successfully", ledgers)
}
