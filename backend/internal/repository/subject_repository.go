package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
)

type PostgresSubjectRepository struct {
	db *gorm.DB
}

func NewPostgresSubjectRepository(db *gorm.DB) *PostgresSubjectRepository {
	return &PostgresSubjectRepository{db: db}
}

func (r *PostgresSubjectRepository) Create(subject *domain.Subject) error {
	subject.ID = "subj-" + uuid.New().String()[:8]
	subject.CreatedAt = time.Now()
	return r.db.Create(subject).Error
}

func (r *PostgresSubjectRepository) GetByID(id string) (*domain.Subject, error) {
	var subject domain.Subject
	err := r.db.First(&subject, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &subject, nil
}

func (r *PostgresSubjectRepository) GetByCode(code string) (*domain.Subject, error) {
	var subject domain.Subject
	err := r.db.First(&subject, "code = ?", code).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &subject, nil
}

func (r *PostgresSubjectRepository) GetAll() ([]domain.Subject, error) {
	var subjects []domain.Subject
	err := r.db.Order("name ASC").Find(&subjects).Error
	return subjects, err
}
