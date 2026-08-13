package repository

import (
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PostgresStudentRepository struct {
	db *gorm.DB
}

func NewPostgresStudentRepository(db *gorm.DB) *PostgresStudentRepository {
	return &PostgresStudentRepository{db: db}
}

func (r *PostgresStudentRepository) GetAllByClass(classID string) ([]domain.Student, error) {
	var students []domain.Student
	err := r.db.Where("class_id = ?", classID).Order("name ASC").Find(&students).Error
	return students, err
}

func (r *PostgresStudentRepository) GetByID(id string) (*domain.Student, error) {
	var student domain.Student
	err := r.db.First(&student, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &student, nil
}

func (r *PostgresStudentRepository) Upsert(student *domain.Student) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"nis", "name", "gender", "avatar", "class_id", "attendance_history_rate", "parent_name", "parent_phone", "updated_at"}),
	}).Create(student).Error
}