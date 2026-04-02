package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	reportService service.ReportService
}

func NewReportHandler(reportService service.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

// GetDashboard godoc
// @Summary Get dashboard KPI
// @Tags Reports
// @Produce json
// @Success 200 {object} service.DashboardKPIResponse
// @Router /reports/dashboard [get]
func (h *ReportHandler) GetDashboard(c *gin.Context) {
	kpi, err := h.reportService.GetDashboardKPI(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get dashboard KPI", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Dashboard KPI fetched successfully", kpi)
}

// GetStockReport godoc
// @Summary Get stock report
// @Tags Reports
// @Produce json
// @Success 200 {array} service.StockReportItem
// @Router /reports/stock [get]
func (h *ReportHandler) GetStockReport(c *gin.Context) {
	data, err := h.reportService.GetStockReport(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get stock report", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Stock report fetched successfully", data)
}

// GetMovementReport godoc
// @Summary Get stock movement (ledger) report
// @Tags Reports
// @Produce json
// @Success 200 {array} service.MovementReportItem
// @Router /reports/movements [get]
func (h *ReportHandler) GetMovementReport(c *gin.Context) {
	data, err := h.reportService.GetMovementReport(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get movement report", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Movement report fetched successfully", data)
}

// GetPurchaseReport godoc
// @Summary Get purchase order report
// @Tags Reports
// @Produce json
// @Success 200 {array} service.PurchaseReportItem
// @Router /reports/purchases [get]
func (h *ReportHandler) GetPurchaseReport(c *gin.Context) {
	data, err := h.reportService.GetPurchaseReport(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get purchase report", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Purchase report fetched successfully", data)
}
