package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PostgresTeacherAssignmentRepository struct {
	db *gorm.DB
}

func NewPostgresTeacherAssignmentRepository(db *gorm.DB) *PostgresTeacherAssignmentRepository {
	return &PostgresTeacherAssignmentRepository{db: db}
}

func (r *PostgresTeacherAssignmentRepository) Create(assignment *domain.TeacherAssignment) error {
	assignment.ID = "asgn-" + uuid.New().String()[:8]
	assignment.CreatedAt = time.Now()
	return r.db.Create(assignment).Error
}

func (r *PostgresTeacherAssignmentRepository) Upsert(assignment *domain.TeacherAssignment) error {
	if assignment.ID == "" {
		assignment.ID = "asgn-" + uuid.New().String()[:8]
	}
	assignment.CreatedAt = time.Now()
	return r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{
			{Name: "teacher_id"},
			{Name: "class_id"},
			{Name: "subject_id"},
			{Name: "day_of_week"},
			{Name: "start_time"},
			{Name: "end_time"},
		},
		DoUpdates: clause.AssignmentColumns([]string{"created_at"}),
	}).Create(assignment).Error
}

func (r *PostgresTeacherAssignmentRepository) GetByTeacherAndTime(teacherID, dayOfWeek, currentTime string) (*domain.TeacherAssignment, error) {
	var assignment domain.TeacherAssignment
	err := r.db.Where("teacher_id = ? AND day_of_week = ? AND ? >= start_time AND ? < end_time", teacherID, dayOfWeek, currentTime, currentTime).First(&assignment).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &assignment, nil
}

func (r *PostgresTeacherAssignmentRepository) GetAllByTeacher(teacherID string) ([]domain.TeacherAssignment, error) {
	var assignments []domain.TeacherAssignment
	err := r.db.Where("teacher_id = ?", teacherID).Order("day_of_week ASC, start_time ASC").Find(&assignments).Error
	return assignments, err
}

func (r *PostgresTeacherAssignmentRepository) GetByClass(classID string) ([]domain.TeacherAssignment, error) {
	var assignments []domain.TeacherAssignment
	err := r.db.Where("class_id = ?", classID).Order("day_of_week ASC, start_time ASC").Find(&assignments).Error
	return assignments, err
}

func (r *PostgresTeacherAssignmentRepository) Delete(id string) error {
	return r.db.Delete(&domain.TeacherAssignment{}, "id = ?", id).Error
}
