package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/config"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/db"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/handler"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/middleware"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/queue"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/repository"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/service"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	rabbitmqURL := os.Getenv("RABBITMQ_URL")
	if rabbitmqURL == "" {
		rabbitmqURL = "amqp://guest:guest@localhost:5672/"
	}

	// Initialize RabbitMQ / Supabase Queue Connection
	queueClient, err := queue.NewRabbitMQClient(rabbitmqURL)
	if err != nil {
		log.Printf("[WARN] RabbitMQ connection deferred: %v. Running in standalone fallback mode.\n", err)
	} else {
		defer queueClient.Close()
		log.Println("[INFO] Successfully connected to RabbitMQ Message Broker")
	}

	// Initialize Database Connection
	cfg := config.Load()
	gormDB, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run Migrations
	if err := db.Migrate(gormDB); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	r := gin.Default()

	// CORS Middleware for Monorepo React Frontend
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Healthcheck
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "online",
			"service":  "ihsancloud-guru-backend",
			"queue":    "rabbitmq/supabase",
			"database": "postgres",
		})
	})

	// Public auth routes
	authMiddleware := middleware.NewAuthMiddleware(cfg)
	userRepo := repository.NewPostgresUserRepository(gormDB)
	authService := service.NewAuthService(userRepo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	r.POST("/auth/login", authHandler.Login)

	// Protected API routes
	api := r.Group("/api/v1")
	api.Use(authMiddleware.Handle())
	{
		subjectRepo := repository.NewPostgresSubjectRepository(gormDB)
		classRepo := repository.NewPostgresClassRepository(gormDB)
		assignmentRepo := repository.NewPostgresTeacherAssignmentRepository(gormDB)
		journalRepo := repository.NewPostgresJournalRepository(gormDB)
		syllabusRepo := repository.NewPostgresSyllabusRepository(gormDB)
		studentRepo := repository.NewPostgresStudentRepository(gormDB)

		subjectService := service.NewSubjectService(subjectRepo)
		classService := service.NewClassService(classRepo)
		assignmentService := service.NewTeacherAssignmentService(assignmentRepo)
		studentService := service.NewStudentService(studentRepo)

		subjectHandler := handler.NewSubjectHandler(subjectService)
		classHandler := handler.NewClassHandler(classService)
		assignmentHandler := handler.NewTeacherAssignmentHandler(assignmentService)
		studentHandler := handler.NewStudentHandler(studentService)

		journalHandler := handler.NewJournalHandler(journalRepo, queueClient)
		syllabusHandler := handler.NewSyllabusHandler(syllabusRepo, queueClient)

		// Auth
		api.GET("/auth/me", authHandler.GetCurrentUser)

		// Subjects
		api.POST("/subjects", subjectHandler.CreateSubject)
		api.GET("/subjects", subjectHandler.GetSubjects)
		api.GET("/subjects/code/:code", subjectHandler.GetSubjectByCode)

		// Classes
		api.POST("/classes", classHandler.CreateClass)
		api.GET("/classes", classHandler.GetClasses)
		api.GET("/classes/:id", classHandler.GetClassByID)
		api.GET("/classes/code/:code", classHandler.GetClassByCode)
		api.PUT("/classes/:id", classHandler.UpdateClass)
		api.DELETE("/classes/:id", classHandler.DeleteClass)
		api.GET("/classes/teacher/:teacherId", classHandler.GetClassesByTeacher)

		// Teacher Assignments
		api.POST("/assignments", assignmentHandler.UpsertAssignment)
		api.GET("/assignments/current", assignmentHandler.GetCurrentAssignment)
		api.GET("/assignments/teacher/:teacherId", assignmentHandler.GetAssignmentsByTeacher)
		api.GET("/assignments/teacher/:teacherId/day/:dayOfWeek", assignmentHandler.GetAssignmentsByTeacherAndDay)
		api.GET("/assignments/class/:classId", assignmentHandler.GetAssignmentsByClass)
		api.DELETE("/assignments/:id", assignmentHandler.DeleteAssignment)

		// Berita Acara & Jurnal Mengajar
		api.GET("/journals", journalHandler.GetJournals)
		api.POST("/journals", journalHandler.CreateJournal)
		api.PUT("/journals/:id/verify", journalHandler.VerifyJournal)

		// Silabus & Rencana Ajar
		api.GET("/syllabus", syllabusHandler.GetSyllabus)
		api.POST("/syllabus", syllabusHandler.CreateSyllabus)
		api.PATCH("/syllabus/:id/subtopics/:subId", syllabusHandler.ToggleSubtopic)

		// Students (read-only, synced via RabbitMQ)
		api.GET("/students", studentHandler.GetStudents)
		api.GET("/students/:id", studentHandler.GetStudentByID)
	}

	// Start RabbitMQ student sync consumer
	if queueClient != nil {
		studentRepo := repository.NewPostgresStudentRepository(gormDB)
		if err := queueClient.ConsumeStudentSync(gormDB, func(st *domain.Student) error {
			return studentRepo.Upsert(st)
		}); err != nil {
			log.Printf("[WARN] Failed to start student sync consumer: %v", err)
		}
	}

	fmt.Printf("🚀 IhsanCloud Go Backend Server running on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}