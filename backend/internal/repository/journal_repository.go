package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
)

type PostgresJournalRepository struct {
	db *gorm.DB
}

func NewPostgresJournalRepository(db *gorm.DB) *PostgresJournalRepository {
	return &PostgresJournalRepository{db: db}
}

func (r *PostgresJournalRepository) GetAllByClass(classID string) ([]domain.ClassJournal, error) {
	var journals []domain.ClassJournal
	query := r.db
	if classID != "" {
		query = query.Where("class_id = ?", classID)
	}
	err := query.Order("created_at DESC").Find(&journals).Error
	return journals, err
}

func (r *PostgresJournalRepository) GetByID(id string) (*domain.ClassJournal, error) {
	var journal domain.ClassJournal
	err := r.db.First(&journal, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &journal, nil
}

func (r *PostgresJournalRepository) Save(journal *domain.ClassJournal) error {
	if journal.ID == "" {
		journal.ID = "jour-" + uuid.New().String()[:8]
	}
	if journal.CreatedAt.IsZero() {
		journal.CreatedAt = time.Now()
	}
	return r.db.Save(journal).Error
}

func (r *PostgresJournalRepository) UpdateVerificationStatus(id string, status string) error {
	return r.db.Model(&domain.ClassJournal{}).Where("id = ?", id).Update("verification_status", status).Error
}