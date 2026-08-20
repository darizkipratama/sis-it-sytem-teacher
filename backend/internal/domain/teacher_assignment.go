package domain

import "time"

type TeacherAssignment struct {
	ID         string    `json:"id" gorm:"column:id;primaryKey"`
	TeacherID  string    `json:"teacherId" gorm:"column:teacher_id;index;not null"`
	ClassID    string    `json:"classId" gorm:"column:class_id;index;not null"`
	Class      *Class    `json:"class,omitempty" gorm:"foreignKey:ClassID"`
	SubjectID  string    `json:"subjectId" gorm:"column:subject_id;index;not null"`
	Subject    *Subject  `json:"subject,omitempty" gorm:"foreignKey:SubjectID"`
	DayOfWeek  string    `json:"dayOfWeek" gorm:"column:day_of_week;not null"`
	StartTime  string    `json:"startTime" gorm:"column:start_time;not null"`
	EndTime    string    `json:"endTime" gorm:"column:end_time;not null"`
	CreatedAt  time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type TeacherAssignmentRepository interface {
	Create(assignment *TeacherAssignment) error
	Upsert(assignment *TeacherAssignment) error
	GetByTeacherAndTime(teacherID, dayOfWeek, currentTime string) (*TeacherAssignment, error)
	GetAllByTeacher(teacherID string) ([]TeacherAssignment, error)
	GetByTeacherAndDay(teacherID, dayOfWeek string) ([]TeacherAssignment, error)
	GetByClass(classID string) ([]TeacherAssignment, error)
	Delete(id string) error
}
