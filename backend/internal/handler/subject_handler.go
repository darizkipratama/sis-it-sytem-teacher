package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/service"
)

type SubjectHandler struct {
	subjectService *service.SubjectService
}

func NewSubjectHandler(subjectService *service.SubjectService) *SubjectHandler {
	return &SubjectHandler{subjectService: subjectService}
}

func (h *SubjectHandler) CreateSubject(c *gin.Context) {
	var input domain.Subject
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.subjectService.Create(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    input,
	})
}

func (h *SubjectHandler) GetSubjects(c *gin.Context) {
	subjects, err := h.subjectService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    subjects,
	})
}

func (h *SubjectHandler) GetSubjectByCode(c *gin.Context) {
	code := c.Param("code")
	subject, err := h.subjectService.GetByCode(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if subject == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subject not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    subject,
	})
}
