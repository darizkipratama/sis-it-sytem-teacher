package domain

import "time"

type Subject struct {
	ID        string    `json:"id" gorm:"column:id;primaryKey"`
	Code      string    `json:"code" gorm:"column:code;uniqueIndex;not null"`
	Name      string    `json:"name" gorm:"column:name;not null"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type SubjectRepository interface {
	Create(subject *Subject) error
	GetByID(id string) (*Subject, error)
	GetByCode(code string) (*Subject, error)
	GetAll() ([]Subject, error)
}
