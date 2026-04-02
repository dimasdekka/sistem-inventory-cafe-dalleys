package handler

import (
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"
	"net/http"

	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PurchaseOrderHandler struct {
	service            service.PurchaseOrderService
	activityLogService service.ActivityLogService
}

func NewPurchaseOrderHandler(service service.PurchaseOrderService, activityLogService service.ActivityLogService) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{service, activityLogService}
}

func (h *PurchaseOrderHandler) Create(c *gin.Context) {
	var req dto.CreatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	res, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create purchase order", err.Error())
		return
	}

	if payload, exists := c.Get("authorization_payload"); exists {
		if authPayload, ok := payload.(*token.AuthPayload); ok {
			_ = h.activityLogService.LogActivity(authPayload.UserID, "CREATE_PURCHASE_ORDER", "Membuat Purchase Order baru: "+res.PONumber)
		}
	}

	response.Success(c, http.StatusCreated, "Purchase order created successfully", res)
}

func (h *PurchaseOrderHandler) FindByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid PO ID format", nil)
		return
	}

	res, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Purchase order not found", nil)
		return
	}

	response.Success(c, http.StatusOK, "Purchase order fetched successfully", res)
}

func (h *PurchaseOrderHandler) FindAll(c *gin.Context) {
	supplierIDStr, hasFilter := c.GetQuery("supplier_id")
	if !hasFilter {
		supplierIDStr, hasFilter = c.GetQuery("supplierId")
	}

	if hasFilter {
		if supplierIDStr == "" {
			response.Success(c, http.StatusOK, "No supplier filter value provided", []*dto.PurchaseOrderResponse{})
			return
		}

		supplierID, err := uuid.Parse(supplierIDStr)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "Invalid supplier ID format", err.Error())
			return
		}

		res, err := h.service.GetBySupplierID(c.Request.Context(), supplierID)
		if err != nil {
			response.Error(c, http.StatusInternalServerError, "Failed to fetch purchase orders by supplier", err.Error())
			return
		}
		response.Success(c, http.StatusOK, "Purchase orders filtered by supplier fetched successfully", res)
		return
	}

	// Default to GetAll only if no supplier filter key is provided at all
	res, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch all purchase orders", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "All purchase orders fetched successfully", res)
}

func (h *PurchaseOrderHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid PO ID format", nil)
		return
	}

	var req dto.UpdatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	userID := uuid.Nil.String()
	if payload, exists := c.Get("authorization_payload"); exists {
		if p, ok := payload.(*token.AuthPayload); ok {
			userID = p.UserID
		}
	}

	res, err := h.service.Update(c.Request.Context(), id, &req, userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update purchase order", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(userID, "UPDATE_PURCHASE_ORDER", "Memperbarui Purchase Order: "+res.PONumber)

	response.Success(c, http.StatusOK, "Purchase order updated successfully", res)
}

func (h *PurchaseOrderHandler) UpdateStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid PO ID format", nil)
		return
	}

	var req dto.UpdatePurchaseOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	userID := uuid.Nil.String()
	if payload, exists := c.Get("authorization_payload"); exists {
		if p, ok := payload.(*token.AuthPayload); ok {
			userID = p.UserID
		}
	}

	err = h.service.UpdateStatus(c.Request.Context(), id, &req, userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update purchase order status", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(userID, "UPDATE_PO_STATUS", "Mengubah status PO menjadi "+req.Status)

	response.Success(c, http.StatusOK, "Purchase order status updated successfully", nil)
}

func (h *PurchaseOrderHandler) GetHistory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid PO ID format", nil)
		return
	}

	po, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Purchase order not found", nil)
		return
	}

	logs, err := h.activityLogService.SearchLogs(po.PONumber, 50)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch PO history", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "PO history fetched successfully", logs)
}
