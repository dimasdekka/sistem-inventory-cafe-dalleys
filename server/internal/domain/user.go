package domain

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email     string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"type:varchar(255);not null" json:"-"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name"`
	Role      string         `gorm:"type:varchar(50);not null;default:'Staff'" json:"role"`
	AvatarURL *string        `gorm:"type:varchar(255);default:null" json:"avatar_url"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type RefreshToken struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    string    `gorm:"type:uuid;not null;index"`
	TokenHash string    `gorm:"type:varchar(255);not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error)
	FindAll() ([]*User, error)
	Update(user *User) error
	Delete(id string) error
	SaveRefreshToken(rt *RefreshToken) error
	FindRefreshToken(hash string) (*RefreshToken, error)
	DeleteRefreshToken(hash string) error
	DeleteAllUserRefreshTokens(userID string) error
}
