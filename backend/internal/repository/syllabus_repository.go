package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
)

type PostgresSyllabusRepository struct {
	db *gorm.DB
}

func NewPostgresSyllabusRepository(db *gorm.DB) *PostgresSyllabusRepository {
	return &PostgresSyllabusRepository{db: db}
}

func (r *PostgresSyllabusRepository) GetAllByClass(classID string) ([]domain.SyllabusTopic, error) {
	var syllabusList []domain.SyllabusTopic
	query := r.db.Preload("Class").Preload("Subject")
	if classID != "" {
		query = query.Where("class_id = ?", classID)
	}
	err := query.Order("created_at DESC").Find(&syllabusList).Error
	return syllabusList, err
}

func (r *PostgresSyllabusRepository) GetByID(id string) (*domain.SyllabusTopic, error) {
	var syllabus domain.SyllabusTopic
	err := r.db.Preload("Class").Preload("Subject").First(&syllabus, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &syllabus, nil
}

func (r *PostgresSyllabusRepository) Save(syllabus *domain.SyllabusTopic) error {
	if syllabus.ID == "" {
		syllabus.ID = "syl-" + uuid.New().String()[:8]
	}
	if syllabus.CreatedAt.IsZero() {
		syllabus.CreatedAt = time.Now()
	}
	return r.db.Save(syllabus).Error
}

func (r *PostgresSyllabusRepository) ToggleSubTopic(syllabusID string, subtopicID string) error {
	var syllabus domain.SyllabusTopic
	if err := r.db.First(&syllabus, "id = ?", syllabusID).Error; err != nil {
		return err
	}

	for i, st := range syllabus.SubTopics {
		if st.ID == subtopicID {
			syllabus.SubTopics[i].Completed = !st.Completed
			break
		}
	}

	return r.db.Model(&domain.SyllabusTopic{}).Where("id = ?", syllabusID).
		Update("sub_topics", syllabus.SubTopics).Error
}