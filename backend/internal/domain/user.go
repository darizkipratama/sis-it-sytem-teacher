package domain

import "time"

type User struct {
	ID           string    `json:"id" gorm:"column:id;primaryKey"`
	NIP          string    `json:"nip" gorm:"column:nip;uniqueIndex;not null"`
	Name         string    `json:"name" gorm:"column:name;not null"`
	Title        string    `json:"title" gorm:"column:title"`
	Role         string    `json:"role" gorm:"column:role;not null"`
	Email        string    `json:"email" gorm:"column:email;uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:"column:password_hash;not null"`
	Avatar       string    `json:"avatar,omitempty" gorm:"column:avatar"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

type UserRepository interface {
	Create(user *User) error
	FindByNIPOrEmail(nipOrEmail string) (*User, error)
}