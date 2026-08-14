package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/service"
)

type ClassHandler struct {
	classService *service.ClassService
}

func NewClassHandler(classService *service.ClassService) *ClassHandler {
	return &ClassHandler{classService: classService}
}

func (h *ClassHandler) CreateClass(c *gin.Context) {
	var input domain.Class
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.classService.Create(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    input,
	})
}

func (h *ClassHandler) GetClasses(c *gin.Context) {
	teacherID := c.Query("teacherId")
	var classes []domain.Class
	var err error

	if teacherID != "" {
		classes, err = h.classService.GetAllByTeacher(teacherID)
	} else {
		classes, err = h.classService.GetAllByTeacher("")
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    classes,
	})
}

func (h *ClassHandler) GetClassByID(c *gin.Context) {
	id := c.Param("id")
	class, err := h.classService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if class == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    class,
	})
}

func (h *ClassHandler) GetClassByCode(c *gin.Context) {
	code := c.Param("code")
	class, err := h.classService.GetByCode(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if class == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    class,
	})
}

func (h *ClassHandler) UpdateClass(c *gin.Context) {
	id := c.Param("id")
	var input domain.Class
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.ID = id

	if err := h.classService.Update(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    input,
	})
}

func (h *ClassHandler) DeleteClass(c *gin.Context) {
	id := c.Param("id")
	if err := h.classService.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Class deleted successfully",
	})
}

func (h *ClassHandler) GetClassesByTeacher(c *gin.Context) {
	teacherID := c.Param("teacherId")
	classes, err := h.classService.GetAllByTeacher(teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    classes,
	})
}
