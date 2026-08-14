package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/service"
)

type TeacherAssignmentHandler struct {
	assignmentService *service.TeacherAssignmentService
}

func NewTeacherAssignmentHandler(assignmentService *service.TeacherAssignmentService) *TeacherAssignmentHandler {
	return &TeacherAssignmentHandler{assignmentService: assignmentService}
}

func (h *TeacherAssignmentHandler) UpsertAssignment(c *gin.Context) {
	var input domain.TeacherAssignment
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.assignmentService.Upsert(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    input,
	})
}

func (h *TeacherAssignmentHandler) GetCurrentAssignment(c *gin.Context) {
	teacherID := c.Query("teacherId")
	if teacherID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "teacherId is required"})
		return
	}

	assignment, err := h.assignmentService.GetCurrentAssignment(teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if assignment == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    assignment,
	})
}

func (h *TeacherAssignmentHandler) GetAssignmentsByTeacher(c *gin.Context) {
	teacherID := c.Param("teacherId")
	assignments, err := h.assignmentService.GetAllByTeacher(teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    assignments,
	})
}

func (h *TeacherAssignmentHandler) GetAssignmentsByClass(c *gin.Context) {
	classID := c.Param("classId")
	assignments, err := h.assignmentService.GetByClass(classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    assignments,
	})
}

func (h *TeacherAssignmentHandler) DeleteAssignment(c *gin.Context) {
	id := c.Param("id")
	if err := h.assignmentService.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Assignment deleted successfully",
	})
}
