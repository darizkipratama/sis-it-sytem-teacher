# Backend PostgreSQL + GORM Integration Plan

## Project Analysis

### Current Architecture
- **Framework**: Gin (Go 1.22)
- **Module**: `github.com/ihsancloud/aplikasi-guru-backend`
- **Message Queue**: RabbitMQ + Supabase Realtime
- **Data Layer**: In-memory repositories (`sync.RWMutex` maps)
- **Domain Models**: `ClassJournal` (Berita Acara), `SyllabusTopic` (Silabus)

### Key Observations
1. `ClassJournal` already has `db:"..."` struct tags (database convention present)
2. Repositories use interface pattern (`domain.JournalRepository`, `domain.SyllabusRepository`)
3. Seed data exists for both entities
4. No authentication/authorization layer yet
5. Frontend is React (monorepo structure)

## Recommendation: GORM

**Why GORM over alternatives:**
- **vs sqlx**: GORM handles relationships, JSON columns, and migrations automatically. sqlx requires raw SQL.
- **vs ent**: Steeper learning curve and code generation overhead. GORM is convention-based.
- **vs pgx**: Lower-level, requires manual mapping. GORM fits the current repository interface pattern better.

GORM provides the best balance of:
- PostgreSQL JSON/JSONB support (for `LearningObjectives`, `SubTopics`)
- Auto-migration for schema evolution
- Minimal code churn from current memory repos

## Implementation Plan

### Phase 1: Dependency & Configuration (1-2 hours)

**Files to create/modify:**
- `backend/go.mod` — Add `gorm.io/gorm`, `gorm.io/driver/postgres`, `github.com/jackc/pgx/v5`
- `backend/.env` — Add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`
- `backend/internal/config/config.go` — New file: centralized config loader using `godotenv` or `os.Getenv`

### Phase 2: Database Connection & Migration (1-2 hours)

**Files to create/modify:**
- `backend/internal/db/database.go` — New file: GORM PostgreSQL connection with `pgx` driver, connection pooling, health check
- `backend/internal/db/migration.go` — New file: `AutoMigrate()` for `ClassJournal` and `SyllabusTopic` + initial seed data

**Schema design:**

```sql
-- journals table
class_journals:
  id              VARCHAR PRIMARY KEY
  session_id      VARCHAR NOT NULL
  class_id        VARCHAR NOT NULL INDEX
  subject         VARCHAR NOT NULL
  date            VARCHAR NOT NULL
  period          VARCHAR NOT NULL
  material_taught TEXT
  achievements    TEXT
  obstacles_and_solutions TEXT
  student_behavior_notes  TEXT
  incident_report TEXT
  present_count   INTEGER DEFAULT 0
  absent_count    INTEGER DEFAULT 0
  verification_status VARCHAR DEFAULT 'PENDING'
  teacher_name    VARCHAR NOT NULL
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()

-- syllabus table
syllabus_topics:
  id               VARCHAR PRIMARY KEY
  class_id         VARCHAR NOT NULL INDEX
  subject          VARCHAR NOT NULL
  grade_level      VARCHAR
  title            VARCHAR NOT NULL
  chapter          VARCHAR
  competency_target TEXT
  learning_objectives JSONB DEFAULT '[]'
  sub_topics       JSONB DEFAULT '[]'
  reference_materials JSONB DEFAULT '[]'
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
```

**Indexes:**
- `class_journals.class_id` (frequent filter)
- `syllabus_topics.class_id` (frequent filter)
- `class_journals.created_at` (optional, for sorting)

### Phase 3: Domain Model Updates (30 min)

**Files to modify:**
- `backend/internal/domain/journal.go` — Add GORM tags to `ClassJournal`
- `backend/internal/domain/syllabus.go` — Add GORM tags to `SyllabusTopic` and `SubTopic`

Changes needed:
- Add `gorm:"column:..."` tags alongside existing `db:"..."`
- Ensure `ID` field is marked as primary key
- JSONB fields use `type:jsonb` GORM tag

### Phase 4: Repository Implementation (2-3 hours)

**Files to modify:**
- `backend/internal/repository/journal_repository.go` — Replace `MemoryJournalRepository` with `PostgresJournalRepository` implementing `domain.JournalRepository`
- `backend/internal/repository/syllabus_repository.go` — Replace `MemorySyllabusRepository` with `PostgresSyllabusRepository` implementing `domain.SyllabusRepository`

**Interface remains unchanged** — handlers do not need modification.

**Key repository methods:**
```go
type PostgresJournalRepository struct {
    db *gorm.DB
}

func (r *PostgresJournalRepository) GetAllByClass(classID string) ([]domain.ClassJournal, error)
func (r *PostgresJournalRepository) GetByID(id string) (*domain.ClassJournal, error)
func (r *PostgresJournalRepository) Save(journal *domain.ClassJournal) error
func (r *PostgresJournalRepository) UpdateVerificationStatus(id string, status string) error
```

```go
type PostgresSyllabusRepository struct {
    db *gorm.DB
}

func (r *PostgresSyllabusRepository) GetAllByClass(classID string) ([]domain.SyllabusTopic, error)
func (r *PostgresSyllabusRepository) GetByID(id string) (*domain.SyllabusTopic, error)
func (r *PostgresSyllabusRepository) Save(syllabus *domain.SyllabusTopic) error
func (r *PostgresSyllabusRepository) ToggleSubTopic(syllabusID string, subtopicID string) error
```

**Complex JSONB operations:**
- `ToggleSubTopic` will use GORM's JSONB update: `db.Model(&s).Update("sub_topics", updatedSubTopics)`
- `Save` should handle both INSERT and UPDATE (upsert or check existence)

### Phase 5: Main Application Wiring (30 min)

**Files to modify:**
- `backend/cmd/api/main.go` — Initialize DB connection, run migrations, pass DB to handlers instead of memory repos

Current handler constructors need DB injection:
```go
func NewJournalHandler(db *gorm.DB, qc *queue.RabbitMQClient) *JournalHandler
func NewSyllabusHandler(db *gorm.DB, qc *queue.RabbitMQClient) *SyllabusHandler
```

### Phase 6: Infrastructure & Tooling (1 hour)

**Files to create:**
- `backend/docker-compose.yml` — PostgreSQL service with healthcheck
- `backend/.env.example` — Template for environment variables
- `backend/Makefile` — Commands for `migrate`, `seed`, `run`

**Optional:**
- `backend/internal/db/seed.go` — Separate seed file for demo data
- `backend/internal/middleware/cors.go` — Extract CORS from main.go (cleanup)

### Phase 7: Testing & Validation (1-2 hours)

- Run `go mod tidy` and fix imports
- Verify handlers return same JSON shapes (backward compatibility)
- Test CRUD operations via curl/Postman
- Verify JSONB serialization for `SubTopics` and `LearningObjectives`
- Check connection pooling and graceful shutdown

## Migration Path

1. Keep `domain` interfaces unchanged
2. Add `PostgresXxxRepository` structs
3. Keep memory repos available (can use for tests)
4. Switch handlers via constructor injection
5. Environment variable toggle: `USE_MEMORY_DB=true` for fallback

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| JSONB serialization mismatch | Test thoroughly; GORM marshals `[]string` and struct slices correctly |
| UUID vs string IDs | Current code uses string IDs; keep consistent |
| Connection leaks | Use GORM's built-in connection pool; set `MaxOpenConns`, `MaxIdleConns` |
| Migration conflicts | Use explicit column names; avoid GORM auto-migration in production |

## Estimated Timeline

- Total: ~6-9 hours of development
- Recommended order: Phase 1 → 2 → 3 → 4 → 5 → 6 → 7
