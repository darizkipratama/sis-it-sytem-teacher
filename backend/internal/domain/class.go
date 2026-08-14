package domain

import "time"

type Class struct {
	ID           string    `json:"id" gorm:"column:id;primaryKey"`
	Code         string    `json:"code" gorm:"column:code;uniqueIndex;not null"`
	Name         string    `json:"name" gorm:"column:name;not null"`
	GradeLevel   string    `json:"gradeLevel" gorm:"column:grade_level"`
	TeacherID    string    `json:"teacherId" gorm:"column:teacher_id;index;not null"`
	AcademicYear string    `json:"academicYear" gorm:"column:academic_year"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at;autoUpdateTime"`
}

type ClassRepository interface {
	Create(class *Class) error
	GetByID(id string) (*Class, error)
	GetByCode(code string) (*Class, error)
	GetAllByTeacher(teacherID string) ([]Class, error)
	Update(class *Class) error
	Delete(id string) error
}
