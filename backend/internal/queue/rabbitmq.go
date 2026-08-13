package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
)

type RabbitMQClient struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

type StudentSyncHandler func(*domain.Student) error

func NewRabbitMQClient(url string) (*RabbitMQClient, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	// Declare exchange for journal events
	err = ch.ExchangeDeclare(
		"ihsancloud.journal.exchange", // name
		"topic",                       // type
		true,                          // durable
		false,                         // auto-deleted
		false,                         // internal
		false,                         // no-wait
		nil,                           // arguments
	)
	if err != nil {
		log.Printf("[WARN] Failed to declare exchange: %v", err)
	}

	// Declare exchange for student sync events
	err = ch.ExchangeDeclare(
		"ihsancloud.student.exchange", // name
		"topic",                       // type
		true,                          // durable
		false,                         // auto-deleted
		false,                         // internal
		false,                         // no-wait
		nil,                           // arguments
	)
	if err != nil {
		log.Printf("[WARN] Failed to declare student exchange: %v", err)
	}

	return &RabbitMQClient{
		conn:    conn,
		channel: ch,
	}, nil
}

func (r *RabbitMQClient) PublishEvent(exchange string, routingKey string, payload interface{}) error {
	if r == nil || r.channel == nil {
		log.Printf("[FALLBACK QUEUE] Event topic: %s, Routing: %s, Payload: %+v\n", exchange, routingKey, payload)
		return nil
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	err = r.channel.Publish(
		exchange,   // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Timestamp:   time.Now(),
			Body:        body,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message to RabbitMQ: %w", err)
	}

	log.Printf("[RABBITMQ PUBLISHED] Exchange: %s | Key: %s", exchange, routingKey)
	return nil
}

func (r *RabbitMQClient) ConsumeStudentSync(db *gorm.DB, syncHandler StudentSyncHandler) error {
	if r == nil || r.channel == nil {
		return fmt.Errorf("rabbitmq channel not initialized")
	}

	q, err := r.channel.QueueDeclare(
		"student_sync_queue", // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	err = r.channel.QueueBind(
		q.Name,                            // queue name
		"student.synced",                  // routing key
		"ihsancloud.student.exchange",     // exchange
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	msgs, err := r.channel.Consume(
		q.Name, // queue
		"",     // consumer tag
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	go func() {
		for d := range msgs {
			var student domain.Student
			if err := json.Unmarshal(d.Body, &student); err != nil {
				log.Printf("[STUDENT SYNC] Failed to unmarshal: %v", err)
				d.Nack(false, false)
				continue
			}

			if err := syncHandler(&student); err != nil {
				log.Printf("[STUDENT SYNC] Failed to process student %s: %v", student.ID, err)
				d.Nack(false, true)
				continue
			}

			log.Printf("[STUDENT SYNC] Upserted student %s (%s)", student.ID, student.Name)
			d.Ack(false)
		}
	}()

	log.Println("[STUDENT SYNC] Consumer started")
	return nil
}

func (r *RabbitMQClient) Close() {
	if r.channel != nil {
		r.channel.Close()
	}
	if r.conn != nil {
		r.conn.Close()
	}
}
