package handler

import (
	"net/http"

	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
)

type SettingHandler struct {
	settingService service.SettingService
}

func NewSettingHandler(settingService service.SettingService) *SettingHandler {
	return &SettingHandler{settingService}
}

func (h *SettingHandler) Save(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpsertSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request format", err.Error())
		return
	}

	payload, exists := c.Get("authorization_payload")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	authPayload := payload.(*token.AuthPayload)
	userID := authPayload.UserID

	if err := h.settingService.SaveSetting(id, req, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save setting", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Setting saved successfully", nil)
}

func (h *SettingHandler) FindByID(c *gin.Context) {
	id := c.Param("id")

	setting, err := h.settingService.GetSettingByID(id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch setting", err.Error())
		return
	}

	if setting == nil {
		response.Error(c, http.StatusNotFound, "Setting not found", nil)
		return
	}

	response.Success(c, http.StatusOK, "Setting fetched successfully", setting)
}

func (h *SettingHandler) FindAll(c *gin.Context) {
	settings, err := h.settingService.GetAllSettings()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch settings", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Settings fetched successfully", settings)
}
