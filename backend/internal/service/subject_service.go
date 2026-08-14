package service

import (
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/repository"
)

type SubjectService struct {
	subjectRepo *repository.PostgresSubjectRepository
}

func NewSubjectService(subjectRepo *repository.PostgresSubjectRepository) *SubjectService {
	return &SubjectService{subjectRepo: subjectRepo}
}

func (s *SubjectService) Create(subject *domain.Subject) error {
	return s.subjectRepo.Create(subject)
}

func (s *SubjectService) GetByID(id string) (*domain.Subject, error) {
	return s.subjectRepo.GetByID(id)
}

func (s *SubjectService) GetByCode(code string) (*domain.Subject, error) {
	return s.subjectRepo.GetByCode(code)
}

func (s *SubjectService) GetAll() ([]domain.Subject, error) {
	return s.subjectRepo.GetAll()
}
