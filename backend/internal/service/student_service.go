package service

import (
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/repository"
)

type StudentService struct {
	studentRepo *repository.PostgresStudentRepository
}

func NewStudentService(studentRepo *repository.PostgresStudentRepository) *StudentService {
	return &StudentService{studentRepo: studentRepo}
}

func (s *StudentService) GetAllByClass(classID string) ([]domain.Student, error) {
	return s.studentRepo.GetAllByClass(classID)
}

func (s *StudentService) GetByID(id string) (*domain.Student, error) {
	return s.studentRepo.GetByID(id)
}