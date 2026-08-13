package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/queue"
)

type SyllabusHandler struct {
	repo        domain.SyllabusRepository
	queueClient *queue.RabbitMQClient
	supabaseQ   *queue.SupabaseQueue
}

func NewSyllabusHandler(repo domain.SyllabusRepository, qc *queue.RabbitMQClient) *SyllabusHandler {
	return &SyllabusHandler{
		repo:        repo,
		queueClient: qc,
		supabaseQ:   queue.NewSupabaseQueue(),
	}
}

func (h *SyllabusHandler) GetSyllabus(c *gin.Context) {
	classID := c.Query("classId")
	syllabusList, err := h.repo.GetAllByClass(classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    syllabusList,
	})
}

func (h *SyllabusHandler) CreateSyllabus(c *gin.Context) {
	var input domain.SyllabusTopic
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Save(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Dispatch Async Event Queue
	_ = h.queueClient.PublishEvent("ihsancloud.syllabus.exchange", "syllabus.created", input)
	_ = h.supabaseQ.DispatchRealtimeEvent("ihsancloud.syllabus.exchange", "LESSON_PLAN_CREATED", input)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    input,
		"message": "Rencana Ajar / Silabus berhasil ditambahkan ke backend Go",
	})
}

func (h *SyllabusHandler) ToggleSubtopic(c *gin.Context) {
	syllabusID := c.Param("id")
	subID := c.Param("subId")

	if err := h.repo.ToggleSubTopic(syllabusID, subID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sub-topik silabus berhasil diubah statusnya",
	})
}
