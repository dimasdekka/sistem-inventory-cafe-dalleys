package handler

import (
	"context"
	"net/http"
	"time"

	"caffe-dalley-backend/internal/database"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService        service.AuthService
	activityLogService service.ActivityLogService
}

func NewAuthHandler(authService service.AuthService, activityLogService service.ActivityLogService) *AuthHandler {
	return &AuthHandler{authService, activityLogService}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.authService.Login(req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Login failed", err.Error())
		return
	}

	// Log Action
	_ = h.activityLogService.LogActivity(res.User.ID, "LOGIN", "Pengguna berhasil login ke sistem")

	response.Success(c, http.StatusOK, "Login successful", res)
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.authService.Refresh(req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Refresh failed", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Token refreshed successfully", res)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var req dto.RefreshRequest // Reusing this to grab the refresh token
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	// Remove refresh token
	if err := h.authService.Logout(req.RefreshToken); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to logout", err.Error())
		return
	}

	// Blacklist current access token
	authHeader := c.GetHeader("Authorization")
	if len(authHeader) > 7 {
		accessToken := authHeader[7:]
		// 15 mins expiry for blacklist mapping the max access token validity
		database.RedisClient.Set(context.Background(), "blacklist:token:"+accessToken, "1", 15*time.Minute)
	}

	response.Success(c, http.StatusOK, "Logout successful", nil)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	payload, exists := c.Get("authorization_payload")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	authPayload := payload.(*token.AuthPayload)
	user, err := h.authService.GetMe(authPayload.UserID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "User data retrieved", user)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	payload, _ := c.Get("authorization_payload")
	authPayload := payload.(*token.AuthPayload)

	if err := h.authService.ChangePassword(authPayload.UserID, req); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to change password", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(authPayload.UserID, "CHANGE_PASSWORD", "Pengguna mengganti kata sandi pengaman")

	response.Success(c, http.StatusOK, "Password changed successfully", nil)
}

func (h *AuthHandler) UploadAvatar(c *gin.Context) {
	file, err := c.FormFile("avatar")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid file upload", err.Error())
		return
	}

	if file.Size > 2*1024*1024 { // 2MB
		response.Error(c, http.StatusBadRequest, "Image size exceeds 2MB", nil)
		return
	}

	payload, exists := c.Get("authorization_payload")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	authPayload := payload.(*token.AuthPayload)

	if err := h.authService.UploadAvatar(c.Request.Context(), authPayload.UserID, file); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to upload avatar", err.Error())
		return
	}

	_ = h.activityLogService.LogActivity(authPayload.UserID, "UPDATE_PROFILE", "Pengguna memperbarui foto profil")
	response.Success(c, http.StatusOK, "Avatar uploaded successfully", nil)
}
