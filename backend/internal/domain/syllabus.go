package domain

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type SubTopic struct {
	ID                  string `json:"id" gorm:"column:id"`
	Title               string `json:"title" gorm:"column:title"`
	Completed           bool   `json:"completed" gorm:"column:completed"`
	RecommendedDuration string `json:"recommendedDuration" gorm:"column:recommended_duration"`
}

type JSONStringSlice []string

func (s JSONStringSlice) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *JSONStringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into JSONStringSlice", value)
	}
	return json.Unmarshal(bytes, s)
}

type JSONSubTopicSlice []SubTopic

func (s JSONSubTopicSlice) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *JSONSubTopicSlice) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into JSONSubTopicSlice", value)
	}
	return json.Unmarshal(bytes, s)
}

type SyllabusTopic struct {
	ID                  string          `json:"id" gorm:"column:id;primaryKey"`
	ClassID              string          `json:"classId" gorm:"column:class_id;index;not null"`
	Class                *Class          `json:"class,omitempty" gorm:"foreignKey:ClassID"`
	SubjectID            string          `json:"subjectId" gorm:"column:subject_id;index;not null"`
	Subject              *Subject        `json:"subject,omitempty" gorm:"foreignKey:SubjectID"`
	GradeLevel           string          `json:"gradeLevel" gorm:"column:grade_level"`
	Title               string          `json:"title" gorm:"column:title"`
	Chapter             string          `json:"chapter" gorm:"column:chapter"`
	CompetencyTarget    string          `json:"competencyTarget" gorm:"column:competency_target"`
	LearningObjectives  JSONStringSlice `json:"learningObjectives" gorm:"column:learning_objectives;type:jsonb"`
	SubTopics           JSONSubTopicSlice `json:"subTopics" gorm:"column:sub_topics;type:jsonb"`
	ReferenceMaterials  JSONStringSlice `json:"referenceMaterials" gorm:"column:reference_materials;type:jsonb"`
	CreatedAt           time.Time       `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type SyllabusRepository interface {
	GetAllByClass(classID string) ([]SyllabusTopic, error)
	GetByID(id string) (*SyllabusTopic, error)
	Save(syllabus *SyllabusTopic) error
	ToggleSubTopic(syllabusID string, subtopicID string) error
}
