package domain

import "time"

type AsyncMessageEvent struct {
	ID        string      `json:"id"`
	Timestamp time.Time   `json:"timestamp"`
	Topic     string      `json:"topic"`
	EventType string      `json:"eventType"`
	Payload   interface{} `json:"payload"`
	Status    string      `json:"status"`
	Attempts  int         `json:"attempts"`
}

type QueuePublisher interface {
	PublishEvent(topic string, eventType string, payload interface{}) error
}
