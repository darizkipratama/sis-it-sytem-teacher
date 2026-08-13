package domain

import "time"

type SubTopic struct {
	ID                  string `json:"id" gorm:"column:id;primaryKey"`
	Title               string `json:"title" gorm:"column:title"`
	Completed           bool   `json:"completed" gorm:"column:completed"`
	RecommendedDuration string `json:"recommendedDuration" gorm:"column:recommended_duration"`
}

type SyllabusTopic struct {
	ID                  string     `json:"id" gorm:"column:id;primaryKey"`
	ClassID             string     `json:"classId" gorm:"column:class_id;index"`
	Subject             string     `json:"subject" gorm:"column:subject"`
	GradeLevel          string     `json:"gradeLevel" gorm:"column:grade_level"`
	Title               string     `json:"title" gorm:"column:title"`
	Chapter             string     `json:"chapter" gorm:"column:chapter"`
	CompetencyTarget    string     `json:"competencyTarget" gorm:"column:competency_target"`
	LearningObjectives  []string   `json:"learningObjectives" gorm:"column:learning_objectives;type:jsonb"`
	SubTopics           []SubTopic `json:"subTopics" gorm:"column:sub_topics;type:jsonb"`
	ReferenceMaterials  []string   `json:"referenceMaterials" gorm:"column:reference_materials;type:jsonb"`
	CreatedAt           time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type SyllabusRepository interface {
	GetAllByClass(classID string) ([]SyllabusTopic, error)
	GetByID(id string) (*SyllabusTopic, error)
	Save(syllabus *SyllabusTopic) error
	ToggleSubTopic(syllabusID string, subtopicID string) error
}
