package repository

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
)

type MemoryJournalRepository struct {
	mu       sync.RWMutex
	journals map[string]domain.ClassJournal
}

func NewMemoryJournalRepository() *MemoryJournalRepository {
	repo := &MemoryJournalRepository{
		journals: make(map[string]domain.ClassJournal),
	}

	// Initial Seed Data
	seed := domain.ClassJournal{
		ID:                    "jour-101",
		SessionID:             "ses-101",
		ClassID:               "10-IPA-1",
		Subject:               "Matematika Lanjut",
		Date:                  time.Now().Format("2006-01-02"),
		Period:                "Jam 01 - 02 (07.30 - 09.00 WIB)",
		MaterialTaught:        "Konsep Vektor 3D, Dot Product & Sudut Orthogonal.",
		Achievements:          "85% siswa menguasai perhitungan sudut vektor 3D.",
		ObstaclesAndSolutions: "3 siswa butuh bimbingan sumbu Z.",
		StudentBehaviorNotes:  "Sangat kondusif dan aktif berdiskusi.",
		IncidentReport:        "Kelas berjalan sesuai jadwal tanpa hambatan.",
		PresentCount:          26,
		AbsentCount:           2,
		VerificationStatus:    "Disahkan Headmaster",
		TeacherName:           "Pak Ihsan Cloud, S.Pd",
		CreatedAt:             time.Now(),
	}
	repo.journals[seed.ID] = seed

	return repo
}

func (r *MemoryJournalRepository) GetAllByClass(classID string) ([]domain.ClassJournal, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []domain.ClassJournal
	for _, j := range r.journals {
		if classID == "" || j.ClassID == classID {
			result = append(result, j)
		}
	}
	return result, nil
}

func (r *MemoryJournalRepository) GetByID(id string) (*domain.ClassJournal, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if j, exists := r.journals[id]; exists {
		return &j, nil
	}
	return nil, nil
}

func (r *MemoryJournalRepository) Save(journal *domain.ClassJournal) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if journal.ID == "" {
		journal.ID = "jour-" + uuid.New().String()[:8]
	}
	if journal.CreatedAt.IsZero() {
		journal.CreatedAt = time.Now()
	}

	r.journals[journal.ID] = *journal
	return nil
}

func (r *MemoryJournalRepository) UpdateVerificationStatus(id string, status string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if j, exists := r.journals[id]; exists {
		j.VerificationStatus = status
		r.journals[id] = j
	}
	return nil
}
