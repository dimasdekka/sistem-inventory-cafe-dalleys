package handler

import (
	"net/http"
	"strconv"

	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type ActivityLogHandler struct {
	activityLogService service.ActivityLogService
}

func NewActivityLogHandler(activityLogService service.ActivityLogService) *ActivityLogHandler {
	return &ActivityLogHandler{activityLogService}
}

func (h *ActivityLogHandler) FindLatest(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}

	logs, err := h.activityLogService.GetLatestLogs(limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch activity logs", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Activity logs fetched successfully", logs)
}
