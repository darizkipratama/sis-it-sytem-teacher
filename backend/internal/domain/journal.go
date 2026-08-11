package domain

import "time"

type ClassJournal struct {
	ID                    string    `json:"id" db:"id"`
	SessionID             string    `json:"sessionId" db:"session_id"`
	ClassID               string    `json:"classId" db:"class_id"`
	Subject               string    `json:"subject" db:"subject"`
	Date                  string    `json:"date" db:"date"`
	Period                string    `json:"period" db:"period"`
	MaterialTaught        string    `json:"materialTaught" db:"material_taught"`
	Achievements          string    `json:"achievements" db:"achievements"`
	ObstaclesAndSolutions string    `json:"obstaclesAndSolutions" db:"obstacles_and_solutions"`
	StudentBehaviorNotes  string    `json:"studentBehaviorNotes" db:"student_behavior_notes"`
	IncidentReport        string    `json:"incidentReport" db:"incident_report"`
	PresentCount          int       `json:"presentCount" db:"present_count"`
	AbsentCount           int       `json:"absentCount" db:"absent_count"`
	VerificationStatus    string    `json:"verificationStatus" db:"verification_status"`
	TeacherName           string    `json:"teacherName" db:"teacher_name"`
	CreatedAt             time.Time `json:"createdAt" db:"created_at"`
}

type JournalRepository interface {
	GetAllByClass(classID string) ([]ClassJournal, error)
	GetByID(id string) (*ClassJournal, error)
	Save(journal *ClassJournal) error
	UpdateVerificationStatus(id string, status string) error
}
