package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
)

type PostgresClassRepository struct {
	db *gorm.DB
}

func NewPostgresClassRepository(db *gorm.DB) *PostgresClassRepository {
	return &PostgresClassRepository{db: db}
}

func (r *PostgresClassRepository) Create(class *domain.Class) error {
	class.ID = "cls-" + uuid.New().String()[:8]
	class.CreatedAt = time.Now()
	class.UpdatedAt = time.Now()
	return r.db.Create(class).Error
}

func (r *PostgresClassRepository) GetByID(id string) (*domain.Class, error) {
	var class domain.Class
	err := r.db.First(&class, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &class, nil
}

func (r *PostgresClassRepository) GetByCode(code string) (*domain.Class, error) {
	var class domain.Class
	err := r.db.First(&class, "code = ?", code).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &class, nil
}

func (r *PostgresClassRepository) GetAllByTeacher(teacherID string) ([]domain.Class, error) {
	var classes []domain.Class
	err := r.db.Where("teacher_id = ?", teacherID).Order("created_at DESC").Find(&classes).Error
	return classes, err
}

func (r *PostgresClassRepository) Update(class *domain.Class) error {
	class.UpdatedAt = time.Now()
	return r.db.Save(class).Error
}

func (r *PostgresClassRepository) Delete(id string) error {
	return r.db.Delete(&domain.Class{}, "id = ?", id).Error
}
