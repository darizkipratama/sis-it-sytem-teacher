package repository

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
)

type MemorySyllabusRepository struct {
	mu       sync.RWMutex
	syllabus map[string]domain.SyllabusTopic
}

func NewMemorySyllabusRepository() *MemorySyllabusRepository {
	repo := &MemorySyllabusRepository{
		syllabus: make(map[string]domain.SyllabusTopic),
	}

	// Seed Initial Syllabus
	seed := domain.SyllabusTopic{
		ID:                 "syl-1",
		ClassID:            "10-IPA-1",
		Subject:            "Matematika Lanjut",
		GradeLevel:         "Kelas X Semester 2",
		Title:              "Vektor & Operasi Aljabar 3D",
		Chapter:            "Bab 4",
		CompetencyTarget:   "Siswa mampu menganalisis proyeksi vektor dan sudut orthogonal.",
		LearningObjectives: []string{"Memahami penjumlahan vektor", "Perhitungan dot product 3D"},
		SubTopics: []domain.SubTopic{
			{ID: "st-1", Title: "Definisi Vektor & Notasi Komponen", Completed: true, RecommendedDuration: "45 Menit"},
			{ID: "st-2", Title: "Operasi Vektor & Dot Product", Completed: false, RecommendedDuration: "45 Menit"},
		},
		ReferenceMaterials: []string{"Buku Panduan Guru Kurikulum Merdeka"},
		CreatedAt:          time.Now(),
	}

	repo.syllabus[seed.ID] = seed
	return repo
}

func (r *MemorySyllabusRepository) GetAllByClass(classID string) ([]domain.SyllabusTopic, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var list []domain.SyllabusTopic
	for _, s := range r.syllabus {
		if classID == "" || s.ClassID == "" || s.ClassID == classID {
			list = append(list, s)
		}
	}
	return list, nil
}

func (r *MemorySyllabusRepository) GetByID(id string) (*domain.SyllabusTopic, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if s, exists := r.syllabus[id]; exists {
		return &s, nil
	}
	return nil, nil
}

func (r *MemorySyllabusRepository) Save(syllabus *domain.SyllabusTopic) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if syllabus.ID == "" {
		syllabus.ID = "syl-" + uuid.New().String()[:8]
	}
	if syllabus.CreatedAt.IsZero() {
		syllabus.CreatedAt = time.Now()
	}

	r.syllabus[syllabus.ID] = *syllabus
	return nil
}

func (r *MemorySyllabusRepository) ToggleSubTopic(syllabusID string, subtopicID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if s, exists := r.syllabus[syllabusID]; exists {
		for i, st := range s.SubTopics {
			if st.ID == subtopicID {
				s.SubTopics[i].Completed = !st.Completed
				break
			}
		}
		r.syllabus[syllabusID] = s
	}
	return nil
}
