package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/handler"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/queue"
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
			"status": "online",
			"service": "ihsancloud-guru-backend",
			"queue": "rabbitmq/supabase",
		})
	})

	// API Routes Group
	api := r.Group("/api/v1")
	{
		journalHandler := handler.NewJournalHandler(queueClient)
		syllabusHandler := handler.NewSyllabusHandler(queueClient)

		// Berita Acara & Jurnal Mengajar
		api.GET("/journals", journalHandler.GetJournals)
		api.POST("/journals", journalHandler.CreateJournal)
		api.PUT("/journals/:id/verify", journalHandler.VerifyJournal)

		// Silabus & Rencana Ajar
		api.GET("/syllabus", syllabusHandler.GetSyllabus)
		api.POST("/syllabus", syllabusHandler.CreateSyllabus)
		api.PATCH("/syllabus/:id/subtopics/:subId", syllabusHandler.ToggleSubtopic)
	}

	fmt.Printf("🚀 IhsanCloud Go Backend Server running on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
