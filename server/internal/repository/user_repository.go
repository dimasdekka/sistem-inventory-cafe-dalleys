package repository

import (
	"errors"

	"caffe-dalley-backend/internal/domain"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db}
}

func (r *userRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) FindByID(id string) (*domain.User, error) {
	var user domain.User
	err := r.db.First(&user, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) FindAll() ([]*domain.User, error) {
	var users []*domain.User
	err := r.db.Order("created_at desc").Find(&users).Error
	return users, err
}

func (r *userRepository) Update(user *domain.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id string) error {
	return r.db.Delete(&domain.User{}, "id = ?", id).Error
}

func (r *userRepository) SaveRefreshToken(rt *domain.RefreshToken) error {
	return r.db.Create(rt).Error
}

func (r *userRepository) FindRefreshToken(hash string) (*domain.RefreshToken, error) {
	var rt domain.RefreshToken
	err := r.db.Where("token_hash = ?", hash).First(&rt).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &rt, err
}

func (r *userRepository) DeleteRefreshToken(hash string) error {
	return r.db.Where("token_hash = ?", hash).Delete(&domain.RefreshToken{}).Error
}

func (r *userRepository) DeleteAllUserRefreshTokens(userID string) error {
	return r.db.Where("user_id = ?", userID).Delete(&domain.RefreshToken{}).Error
}
