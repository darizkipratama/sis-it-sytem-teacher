# Authorization + Read-Only Student Sync Plan

## Goal
1. Add JWT-based authentication to protect backend routes.
2. Add `Student` entity synchronized from another service via RabbitMQ; expose only read endpoints in this backend.

---

## 1. Authorization Design

### Model
- **`User`** table in PostgreSQL.
- Roles: `teacher`, `headmaster`.
- Passwords hashed with bcrypt.
- At least one seeded headmaster and one teacher for initial access.

### Endpoints
- `POST /auth/login` — accepts `{ nipOrEmail, password }`, returns `{ token, user }` JWT.
- `POST /auth/refresh` — optional; can defer if not needed immediately.

### Middleware
- `AuthMiddleware` — validates `Authorization: Bearer <token>`, parses JWT claims, attaches `userID` and `role` to Gin context.
- `RequireRole(allowedRoles...)` — optional wrapper for routes like `PUT /journals/:id/verify` (headmaster only).

### Public Routes
- `GET /health`
- `POST /auth/login`

### Protected Routes
- All `/api/v1/*` routes require valid JWT.

---

## 2. Student Sync Entity (Read-Only via RabbitMQ)

### Concept
- Another service (e.g., Student Information System) publishes `student.synced` events to `ihsancloud.student.exchange`.
- This backend **consumes** the events and upserts students into PostgreSQL.
- REST API exposes **only GET** endpoints. No POST/PUT/DELETE for students in this service.

### Domain Model
```go
type Student struct {
    ID                  string    `json:"id" gorm:"column:id;primaryKey"`
    NIS                 string    `json:"nis" gorm:"column:nis;uniqueIndex"`
    Name                string    `json:"name" gorm:"column:name"`
    Gender              string    `json:"gender" gorm:"column:gender"`
    Avatar              string    `json:"avatar" gorm:"column:avatar"`
    ClassID             string    `json:"classId" gorm:"column:class_id;index"`
    AttendanceHistoryRate int     `json:"attendanceHistoryRate" gorm:"column:attendance_history_rate"`
    ParentName          string    `json:"parentName" gorm:"column:parent_name"`
    ParentPhone         string    `json:"parentPhone" gorm:"column:parent_phone"`
    CreatedAt           time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
    UpdatedAt           time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}
```

### RabbitMQ Consumer
- Exchange: `ihsancloud.student.exchange` (topic, durable)
- Routing key: `student.synced`
- Consumer goroutine started in `main.go` after DB and RabbitMQ connections are ready.
- On message: unmarshal `Student` payload, upsert into DB (`ON CONFLICT DO UPDATE`).

### Repository & Endpoints
- `StudentRepository` interface + `PostgresStudentRepository`.
- `GET /api/v1/students?classId=10-IPA-1` — list students by class.
- `GET /api/v1/students/:id` — get single student.
- No mutation endpoints.

---

## 3. Implementation Steps

### Step 1: Auth Domain & Config
- `internal/domain/user.go` — `User` struct + `UserRepository` interface.
- `internal/config/config.go` — add `JWTSecret`, `JWTExpiration` (default 24h).

### Step 2: Auth Repository & Service
- `internal/repository/user_repository.go` — `PostgresUserRepository` with bcrypt `Create` and `FindByNIPOrEmail`.
- `internal/service/auth_service.go` — `Login(nipOrEmail, password) (*User, string)` returning JWT.

### Step 3: Auth Handler & Middleware
- `internal/handler/auth_handler.go` — `Login(c *gin.Context)`.
- `internal/middleware/auth.go` — `AuthMiddleware`, `RequireRole`.

### Step 4: Student Domain & Repository
- `internal/domain/student.go` — `Student` struct + `StudentRepository` interface.
- `internal/repository/student_repository.go` — `PostgresStudentRepository` with `GetAllByClass`, `GetByID`, `Upsert`.

### Step 5: Student Handler
- `internal/handler/student_handler.go` — `GetStudents`, `GetStudentByID`.
- Register in `main.go`.

### Step 6: RabbitMQ Student Consumer
- `internal/queue/rabbitmq.go` — add `ConsumeStudentSync(channel *amqp.Channel, db *gorm.DB)` or a callback-based consumer.
- In `main.go`, start consumer goroutine: `go queueClient.ConsumeStudentSync(gormDB)`.

### Step 7: Database Migration & Seed
- `internal/db/migration.go` — add `AutoMigrate(&domain.User{}, &domain.Student{})`.
- Seed at least:
  - Headmaster user (`role: headmaster`)
  - Teacher user (`role: teacher`)
  - 2–3 sample students for class `10-IPA-1`

### Step 8: Wire in `main.go`
- Initialize auth middleware on `/api/v1` group.
- Pass `queueClient` to student consumer.
- Keep existing queue client usage for journal/syllabus events.

---

## 4. New Files

| File | Purpose |
|------|---------|
| `internal/domain/user.go` | User entity + repository interface |
| `internal/domain/student.go` | Student entity + repository interface |
| `internal/repository/user_repository.go` | Postgres user repo with bcrypt |
| `internal/repository/student_repository.go` | Postgres student repo with upsert |
| `internal/service/auth_service.go` | Login + JWT generation logic |
| `internal/handler/auth_handler.go` | POST /auth/login |
| `internal/handler/student_handler.go` | GET students (read-only) |
| `internal/middleware/auth.go` | JWT auth + role guard |
| `internal/queue/rabbitmq.go` (update) | Add student consumer |

## 5. Modified Files

| File | Change |
|------|--------|
| `go.mod` | Add `golang.org/x/crypto` (bcrypt), `github.com/golang-jwt/jwt/v5` |
| `internal/config/config.go` | Add JWT config fields |
| `internal/db/migration.go` | Migrate `User` and `Student`; seed data |
| `cmd/api/main.go` | Wire auth, student consumer, protect routes |

---

## 6. RabbitMQ Contract

### Exchange
- Name: `ihsancloud.student.exchange`
- Type: `topic`
- Durable: `true`

### Message Format
```json
{
  "id": "s1",
  "nis": "20241001",
  "name": "Ahmad Raihan Pratama",
  "gender": "L",
  "avatar": "https://...",
  "classId": "10-IPA-1",
  "attendanceHistoryRate": 98,
  "parentName": "Bpk. Hendra Pratama",
  "parentPhone": "081234567801"
}
```

### Routing Key
- `student.synced`

### Consumer Behavior
- Unmarshal payload into `domain.Student`.
- Upsert by `id` or `nis`.
- Log success/failure; do not crash on bad payload.

---

## 7. Validation

- `go mod tidy` succeeds.
- `go build` succeeds.
- `POST /auth/login` with seeded credentials returns 200 + JWT.
- `GET /api/v1/students` without token returns 401.
- `GET /api/v1/students` with valid token returns 200 + seeded students.
- Publish a `student.synced` message to RabbitMQ → verify student appears/updates in DB.
- `POST /api/v1/students` returns 405 (or route does not exist).

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| JWT secret exposed | Load from env var, never commit. |
| Bad RabbitMQ message crashes consumer | Wrap unmarshal/upsert in recover; log and skip. |
| Duplicate student NIS | Use `uniqueIndex` + `OnConflict` upsert. |
| Password plaintext | bcrypt with cost 10+. |
| Frontend still mocks login | Frontend must call `/auth/login`; noted as follow-up. |
