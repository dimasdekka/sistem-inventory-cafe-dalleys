package domain

import (
	"time"

	"github.com/google/uuid"
)

type Supplier struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(150);not null" json:"name"`
	Contact   string    `gorm:"type:varchar(100)" json:"contact"`
	Email     string    `gorm:"type:varchar(100)" json:"email"`
	Phone     string    `gorm:"type:varchar(50)" json:"phone"`
	Address   string    `gorm:"type:text" json:"address"`
	Status    string    `gorm:"type:varchar(20);default:'active'" json:"status"` // active, inactive
	ImageURL  *string   `gorm:"type:varchar(255);default:null" json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
