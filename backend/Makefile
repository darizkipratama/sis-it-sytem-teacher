.PHONY: run db-up db-down migrate seed tidy lint test

run:
	go run ./cmd/api/main.go

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

migrate:
	@echo "Migrations run automatically on app startup"

seed:
	@echo "Seed data included in migration.go"

tidy:
	go mod tidy

lint:
	go vet ./...

test:
	go test ./...

build:
	go build -o bin/api ./cmd/api/main.go