package service

import (
	"time"

	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/repository"
)

type TeacherAssignmentService struct {
	assignmentRepo *repository.PostgresTeacherAssignmentRepository
}

func NewTeacherAssignmentService(assignmentRepo *repository.PostgresTeacherAssignmentRepository) *TeacherAssignmentService {
	return &TeacherAssignmentService{assignmentRepo: assignmentRepo}
}

func (s *TeacherAssignmentService) Upsert(assignment *domain.TeacherAssignment) error {
	return s.assignmentRepo.Upsert(assignment)
}

func (s *TeacherAssignmentService) GetCurrentAssignment(teacherID string) (*domain.TeacherAssignment, error) {
	now := time.Now()
	dayOfWeek := now.Weekday().String()
	currentTime := now.Format("15:04")
	return s.assignmentRepo.GetByTeacherAndTime(teacherID, dayOfWeek, currentTime)
}

func (s *TeacherAssignmentService) GetAllByTeacher(teacherID string) ([]domain.TeacherAssignment, error) {
	return s.assignmentRepo.GetAllByTeacher(teacherID)
}

func (s *TeacherAssignmentService) GetByTeacherAndDay(teacherID, dayOfWeek string) ([]domain.TeacherAssignment, error) {
	return s.assignmentRepo.GetByTeacherAndDay(teacherID, dayOfWeek)
}

func (s *TeacherAssignmentService) GetByClass(classID string) ([]domain.TeacherAssignment, error) {
	return s.assignmentRepo.GetByClass(classID)
}

func (s *TeacherAssignmentService) Delete(id string) error {
	return s.assignmentRepo.Delete(id)
}
