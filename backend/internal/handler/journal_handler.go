package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/queue"
)

type JournalHandler struct {
	repo        domain.JournalRepository
	queueClient *queue.RabbitMQClient
	supabaseQ   *queue.SupabaseQueue
}

func NewJournalHandler(repo domain.JournalRepository, qc *queue.RabbitMQClient) *JournalHandler {
	return &JournalHandler{
		repo:        repo,
		queueClient: qc,
		supabaseQ:   queue.NewSupabaseQueue(),
	}
}

func (h *JournalHandler) GetJournals(c *gin.Context) {
	classID := c.Query("classId")
	journals, err := h.repo.GetAllByClass(classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    journals,
	})
}

func (h *JournalHandler) CreateJournal(c *gin.Context) {
	var input domain.ClassJournal
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Save(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Dispatch Async Queue Events
	_ = h.queueClient.PublishEvent("ihsancloud.journal.exchange", "journal.created", input)
	_ = h.supabaseQ.DispatchRealtimeEvent("ihsancloud.journal.exchange", "BERITA_ACARA_LOGGED", input)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    input,
		"message": "Berita acara dan jurnal pengajaran berhasil disimpan ke backend Go",
	})
}

func (h *JournalHandler) VerifyJournal(c *gin.Context) {
	journalID := c.Param("id")
	var body struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.UpdateVerificationStatus(journalID, body.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Event publish
	_ = h.queueClient.PublishEvent("ihsancloud.journal.exchange", "journal.verified", map[string]string{
		"id":     journalID,
		"status": body.Status,
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Status verifikasi berita acara berhasil diperbarui",
	})
}
