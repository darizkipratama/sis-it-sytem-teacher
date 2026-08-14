package service

import (
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/repository"
)

type ClassService struct {
	classRepo *repository.PostgresClassRepository
}

func NewClassService(classRepo *repository.PostgresClassRepository) *ClassService {
	return &ClassService{classRepo: classRepo}
}

func (s *ClassService) Create(class *domain.Class) error {
	return s.classRepo.Create(class)
}

func (s *ClassService) GetByID(id string) (*domain.Class, error) {
	return s.classRepo.GetByID(id)
}

func (s *ClassService) GetByCode(code string) (*domain.Class, error) {
	return s.classRepo.GetByCode(code)
}

func (s *ClassService) GetAllByTeacher(teacherID string) ([]domain.Class, error) {
	return s.classRepo.GetAllByTeacher(teacherID)
}

func (s *ClassService) Update(class *domain.Class) error {
	return s.classRepo.Update(class)
}

func (s *ClassService) Delete(id string) error {
	return s.classRepo.Delete(id)
}
