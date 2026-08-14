package domain

import "time"

type Student struct {
	ID                   string    `json:"id" gorm:"column:id;primaryKey"`
	NIS                  string    `json:"nis" gorm:"column:nis;uniqueIndex;not null"`
	Name                 string    `json:"name" gorm:"column:name;not null"`
	Gender               string    `json:"gender" gorm:"column:gender"`
	Avatar               string    `json:"avatar,omitempty" gorm:"column:avatar"`
	ClassID              string     `json:"classId" gorm:"column:class_id;index;not null"`
	Class                *Class     `json:"class,omitempty" gorm:"foreignKey:ClassID"`
	AttendanceHistoryRate int       `json:"attendanceHistoryRate" gorm:"column:attendance_history_rate"`
	ParentName           string    `json:"parentName" gorm:"column:parent_name"`
	ParentPhone          string    `json:"parentPhone" gorm:"column:parent_phone"`
	CreatedAt            time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt            time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

type StudentRepository interface {
	GetAllByClass(classID string) ([]Student, error)
	GetByID(id string) (*Student, error)
	Upsert(student *Student) error
}