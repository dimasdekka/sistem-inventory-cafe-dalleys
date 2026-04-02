package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"mime/multipart"
	"time"

	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/pkg/password"
	"caffe-dalley-backend/pkg/token"
	"caffe-dalley-backend/pkg/upload"

	"golang.org/x/crypto/sha3"
)

type AuthService interface {
	Login(req dto.LoginRequest) (*dto.AuthResponse, error)
	Refresh(req dto.RefreshRequest) (*dto.AuthResponse, error)
	Logout(refreshToken string) error
	GetMe(userID string) (*dto.UserResponse, error)
	ChangePassword(userID string, req dto.ChangePasswordRequest) error
	UploadAvatar(ctx context.Context, userID string, file *multipart.FileHeader) error
}

type authService struct {
	userRepo   domain.UserRepository
	tokenMaker *token.TokenMaker
	cfg        *config.Config
}

func NewAuthService(userRepo domain.UserRepository, tokenMaker *token.TokenMaker, cfg *config.Config) AuthService {
	return &authService{userRepo, tokenMaker, cfg}
}

func hashRefreshToken(token string) string {
	h := sha3.New256()
	h.Write([]byte(token))
	return hex.EncodeToString(h.Sum(nil))
}

func generateOpaqueToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *authService) generateTokens(user *domain.User) (*dto.AuthResponse, error) {
	// Generate Access Token (15 mins)
	accessToken, err := s.tokenMaker.CreateToken(user.ID, user.Role, 15*time.Minute)
	if err != nil {
		return nil, err
	}

	// Generate Refresh Token (7 days)
	plainRefreshToken := generateOpaqueToken()
	hashedToken := hashRefreshToken(plainRefreshToken)

	rt := &domain.RefreshToken{
		UserID:    user.ID,
		TokenHash: hashedToken,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	if err := s.userRepo.SaveRefreshToken(rt); err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: plainRefreshToken, // return the plain token to client
		User: dto.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			Role:      user.Role,
			AvatarURL: user.AvatarURL,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *authService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil || !user.IsActive {
		return nil, errors.New("invalid credentials or account is inactive")
	}

	if !password.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	return s.generateTokens(user)
}

func (s *authService) Refresh(req dto.RefreshRequest) (*dto.AuthResponse, error) {
	hashedToken := hashRefreshToken(req.RefreshToken)
	rt, err := s.userRepo.FindRefreshToken(hashedToken)
	if err != nil {
		return nil, err
	}
	if rt == nil {
		return nil, errors.New("invalid refresh token")
	}

	// Remove old refresh token to achieve rotation
	_ = s.userRepo.DeleteRefreshToken(hashedToken)

	if time.Now().After(rt.ExpiresAt) {
		return nil, errors.New("refresh token expired")
	}

	user, err := s.userRepo.FindByID(rt.UserID)
	if err != nil || user == nil || !user.IsActive {
		return nil, errors.New("user not found or inactive")
	}

	return s.generateTokens(user)
}

func (s *authService) Logout(refreshToken string) error {
	hashedToken := hashRefreshToken(refreshToken)
	return s.userRepo.DeleteRefreshToken(hashedToken)
}

func (s *authService) GetMe(userID string) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Role:      user.Role,
		AvatarURL: user.AvatarURL,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *authService) ChangePassword(userID string, req dto.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil || user == nil {
		return errors.New("user not found")
	}

	if !password.CheckPasswordHash(req.OldPassword, user.Password) {
		return errors.New("invalid old password")
	}

	hashed, err := password.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	user.Password = hashed
	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// Optional: force logout all sessions
	_ = s.userRepo.DeleteAllUserRefreshTokens(userID)
	return nil
}

func (s *authService) UploadAvatar(ctx context.Context, userID string, file *multipart.FileHeader) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil || user == nil {
		return errors.New("user not found")
	}

	objectName := "users/" + user.ID + "-" + file.Filename
	url, err := upload.UploadProductImage(ctx, s.cfg, file, objectName)
	if err != nil {
		return err
	}
	user.AvatarURL = &url

	return s.userRepo.Update(user)
}
