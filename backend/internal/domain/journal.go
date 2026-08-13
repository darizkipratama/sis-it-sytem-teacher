package domain

import "time"

type ClassJournal struct {
	ID                    string    `json:"id" gorm:"column:id;primaryKey"`
	SessionID             string    `json:"sessionId" gorm:"column:session_id"`
	ClassID               string    `json:"classId" gorm:"column:class_id;index"`
	Subject               string    `json:"subject" gorm:"column:subject"`
	Date                  string    `json:"date" gorm:"column:date"`
	Period                string    `json:"period" gorm:"column:period"`
	MaterialTaught        string    `json:"materialTaught" gorm:"column:material_taught"`
	Achievements          string    `json:"achievements" gorm:"column:achievements"`
	ObstaclesAndSolutions string    `json:"obstaclesAndSolutions" gorm:"column:obstacles_and_solutions"`
	StudentBehaviorNotes  string    `json:"studentBehaviorNotes" gorm:"column:student_behavior_notes"`
	IncidentReport        string    `json:"incidentReport" gorm:"column:incident_report"`
	PresentCount          int       `json:"presentCount" gorm:"column:present_count"`
	AbsentCount           int       `json:"absentCount" gorm:"column:absent_count"`
	VerificationStatus    string    `json:"verificationStatus" gorm:"column:verification_status"`
	TeacherName           string    `json:"teacherName" gorm:"column:teacher_name"`
	CreatedAt             time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type JournalRepository interface {
	GetAllByClass(classID string) ([]ClassJournal, error)
	GetByID(id string) (*ClassJournal, error)
	Save(journal *ClassJournal) error
	UpdateVerificationStatus(id string, status string) error
}
