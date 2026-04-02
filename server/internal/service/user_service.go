package service

import (
	"errors"

	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/dto"
	"caffe-dalley-backend/pkg/password"
)

type UserService interface {
	CreateUser(req dto.CreateUserRequest) error
	GetUsers() ([]dto.UserListResponse, error)
	GetUserByID(id string) (*dto.UserListResponse, error)
	UpdateUser(id string, req dto.UpdateUserRequest) error
	DeleteUser(id string) error
}

type userService struct {
	userRepo domain.UserRepository
}

func NewUserService(userRepo domain.UserRepository) UserService {
	return &userService{userRepo}
}

func (s *userService) CreateUser(req dto.CreateUserRequest) error {
	existing, _ := s.userRepo.FindByEmail(req.Email)
	if existing != nil {
		return errors.New("email already in use")
	}

	hashed, err := password.HashPassword(req.Password)
	if err != nil {
		return err
	}

	user := &domain.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashed,
		Role:     req.Role,
		IsActive: true,
	}

	return s.userRepo.Create(user)
}

func (s *userService) GetUsers() ([]dto.UserListResponse, error) {
	users, err := s.userRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var res []dto.UserListResponse
	for _, u := range users {
		res = append(res, dto.UserListResponse{
			ID:        u.ID,
			Email:     u.Email,
			Name:      u.Name,
			Role:      u.Role,
			AvatarURL: u.AvatarURL,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
		})
	}
	return res, nil
}

func (s *userService) GetUserByID(id string) (*dto.UserListResponse, error) {
	u, err := s.userRepo.FindByID(id)
	if err != nil || u == nil {
		return nil, errors.New("user not found")
	}

	return &dto.UserListResponse{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		Role:      u.Role,
		AvatarURL: u.AvatarURL,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
	}, nil
}

func (s *userService) UpdateUser(id string, req dto.UpdateUserRequest) error {
	user, err := s.userRepo.FindByID(id)
	if err != nil || user == nil {
		return errors.New("user not found")
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" && req.Email != user.Email {
		existing, _ := s.userRepo.FindByEmail(req.Email)
		if existing != nil {
			return errors.New("email already in use by another user")
		}
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.Password != "" {
		hashed, err := password.HashPassword(req.Password)
		if err == nil {
			user.Password = hashed
		}
	}

	return s.userRepo.Update(user)
}

func (s *userService) DeleteUser(id string) error {
	user, err := s.userRepo.FindByID(id)
	if err != nil || user == nil {
		return errors.New("user not found")
	}
	return s.userRepo.Delete(id)
}
