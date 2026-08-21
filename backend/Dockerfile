# Stage 1: build
FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/bin/api ./cmd/api/main.go

# Stage 2: run
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/bin/api /app/api
COPY --from=builder /app/.env.example /app/.env

ENV PORT=8080 \
    RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/ \
    DB_HOST=postgres \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DB_NAME=guru_backend \
    DB_SSLMODE=disable \
    JWT_SECRET=super_secret_jwt_key_change_in_production \
    JWT_EXPIRATION_HOURS=24

EXPOSE 8080

ENTRYPOINT ["/app/api"]
