package queue

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

type SupabaseQueue struct {
	URL    string
	APIKey string
}

func NewSupabaseQueue() *SupabaseQueue {
	return &SupabaseQueue{
		URL:    os.Getenv("SUPABASE_URL"),
		APIKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
	}
}

// DispatchRealtimeEvent pushes an async event to Supabase pgmq / realtime table
func (s *SupabaseQueue) DispatchRealtimeEvent(topic string, eventType string, payload interface{}) error {
	if s.URL == "" || s.APIKey == "" {
		log.Printf("[SUPABASE QUEUE FALLBACK] Topic: %s, Event: %s", topic, eventType)
		return nil
	}

	endpoint := fmt.Sprintf("%s/rest/v1/async_events", s.URL)
	eventData := map[string]interface{}{
		"topic":      topic,
		"event_type": eventType,
		"payload":    payload,
		"status":     "QUEUED",
		"created_at": time.Now().Format(time.RFC3339),
	}

	body, err := json.Marshal(eventData)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", s.APIKey)
	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to post event to Supabase queue: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("supabase return error status: %d", resp.StatusCode)
	}

	log.Printf("[SUPABASE QUEUE DISPATCHED] Topic: %s | Event: %s", topic, eventType)
	return nil
}
