package domain

import "time"

type SubTopic struct {
	ID                  string `json:"id"`
	Title               string `json:"title"`
	Completed           bool   `json:"completed"`
	RecommendedDuration string `json:"recommendedDuration"`
}

type SyllabusTopic struct {
	ID                  string     `json:"id"`
	ClassID             string     `json:"classId"`
	Subject             string     `json:"subject"`
	GradeLevel          string     `json:"gradeLevel"`
	Title               string     `json:"title"`
	Chapter             string     `json:"chapter"`
	CompetencyTarget    string     `json:"competencyTarget"`
	LearningObjectives  []string   `json:"learningObjectives"`
	SubTopics           []SubTopic `json:"subTopics"`
	ReferenceMaterials  []string   `json:"referenceMaterials"`
	CreatedAt           time.Time  `json:"createdAt"`
}

type SyllabusRepository interface {
	GetAllByClass(classID string) ([]SyllabusTopic, error)
	GetByID(id string) (*SyllabusTopic, error)
	Save(syllabus *SyllabusTopic) error
	ToggleSubTopic(syllabusID string, subtopicID string) error
}
