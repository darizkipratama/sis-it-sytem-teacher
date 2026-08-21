# Plan: Add Class, Subject, and TeacherAssignment Domains with Relationships

## Goal
Introduce three new domain entities with proper GORM relationships:
1. **Class** — many-to-one with `User` (teacher), one-to-many with `Student`
2. **Subject** — standalone entity for referential integrity
3. **TeacherAssignment** — schedule entries pushed by administration service, used to determine current teaching context

Replace denormalized `class_id` string columns across `Student`, `ClassJournal`, and `SyllabusTopic` with UUID foreign keys referencing `Class.ID`. Replace denormalized `subject` strings with `SubjectID` foreign keys.

## Key Design Decisions

### 1. Class.ID is a UUID; Class.Code is the human-readable identifier
- `Class.ID`: UUID primary key (e.g., `cls-a1b2c3d4`)
- `Class.Code`: unique human-readable string (e.g., `"10-IPA-1"`)
- No existing data to migrate; this is a new project

### 2. Class belongs to Teacher (User)
- `Class.TeacherID` (UUID) -> `User.ID`
- `User.Classes []Class` (one-to-many)

### 3. Class has many Students
- `Student.ClassID` becomes UUID with FK constraint
- `Student.Class *Class` (belongs-to)

### 4. Subject is a standalone domain
- `Subject.ID`, `Subject.Code` (unique), `Subject.Name`
- Populated from administration service
- Referenced by `ClassJournal`, `SyllabusTopic`, and `TeacherAssignment`

### 5. TeacherAssignment is the schedule table
- Populated by administration service (not created by teachers in the app)
- Fields: `teacherId`, `classId`, `subjectId`, `dayOfWeek`, `startTime`, `endTime`
- Used to answer: "what does this teacher teach right now?"
- Read-only via API (no create/update/delete from this app), or minimally writable if needed

### 6. Frontend types
- `ClassId` changes from union to `string` (UUID)
- New `Class`, `Subject` interfaces
- New `TeacherAssignment` interface
- `LocalDataSource` gets CRUD for all three

## Backend Implementation Steps

### Step 1: Create `backend/internal/domain/subject.go`
```go
package domain

import "time"

type Subject struct {
    ID        string    `json:"id" gorm:"column:id;primaryKey"`
    Code      string    `json:"code" gorm:"column:code;uniqueIndex;not null"`
    Name      string    `json:"name" gorm:"column:name;not null"`
    CreatedAt time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type SubjectRepository interface {
    Create(subject *Subject) error
    GetByID(id string) (*Subject, error)
    GetByCode(code string) (*Subject, error)
    GetAll() ([]Subject, error)
}
```

### Step 2: Create `backend/internal/domain/class.go`
```go
package domain

import "time"

type Class struct {
    ID           string    `json:"id" gorm:"column:id;primaryKey"`
    Code         string    `json:"code" gorm:"column:code;uniqueIndex;not null"`
    Name         string    `json:"name" gorm:"column:name;not null"`
    GradeLevel   string    `json:"gradeLevel" gorm:"column:grade_level"`
    TeacherID    string    `json:"teacherId" gorm:"column:teacher_id;index;not null"`
    AcademicYear string    `json:"academicYear" gorm:"column:academic_year"`
    CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
    UpdatedAt    time.Time `json:"updated_at;autoUpdateTime"`
}

type ClassRepository interface {
    Create(class *Class) error
    GetByID(id string) (*Class, error)
    GetByCode(code string) (*Class, error)
    GetAllByTeacher(teacherID string) ([]Class, error)
    Update(class *Class) error
    Delete(id string) error
}
```

Update `user.go`:
```go
type User struct {
    // ... existing fields
    Classes []Class `json:"classes,omitempty" gorm:"foreignKey:TeacherID"`
}
```

### Step 3: Create `backend/internal/domain/teacher_assignment.go`
```go
package domain

import "time"

type TeacherAssignment struct {
    ID         string    `json:"id" gorm:"column:id;primaryKey"`
    TeacherID  string    `json:"teacherId" gorm:"column:teacher_id;index;not null"`
    ClassID    string    `json:"classId" gorm:"column:class_id;index;not null"`
    SubjectID  string    `json:"subjectId" gorm:"column:subject_id;index;not null"`
    DayOfWeek  string    `json:"dayOfWeek" gorm:"column:day_of_week;not null"` // "Monday".."Sunday"
    StartTime  string    `json:"startTime" gorm:"column:start_time;not null"`   // "07:30"
    EndTime    string    `json:"endTime" gorm:"column:end_time;not null"`       // "09:00"
    CreatedAt  time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

type TeacherAssignmentRepository interface {
    Create(assignment *TeacherAssignment) error
    Upsert(assignment *TeacherAssignment) error // idempotent upsert from admin service
    GetByTeacherAndTime(teacherID, dayOfWeek, currentTime string) (*TeacherAssignment, error)
    GetAllByTeacher(teacherID string) ([]TeacherAssignment, error)
    GetByClass(classID string) ([]TeacherAssignment, error)
    Delete(id string) error
}
```

### Step 4: Update `backend/internal/domain/student.go`
```go
type Student struct {
    ID                   string     `json:"id" gorm:"column:id;primaryKey"`
    NIS                  string     `json:"nis" gorm:"column:nis;uniqueIndex;not null"`
    Name                 string     `json:"name" gorm:"column:name;not null"`
    Gender               string     `json:"gender" gorm:"column:gender"`
    Avatar               string     `json:"avatar,omitempty" gorm:"column:avatar"`
    ClassID              string     `json:"classId" gorm:"column:class_id;index;not null"`
    Class                *Class     `json:"class,omitempty" gorm:"foreignKey:ClassID"`
    AttendanceHistoryRate int       `json:"attendanceHistoryRate" gorm:"column:attendance_history_rate"`
    ParentName           string     `json:"parentName" gorm:"column:parent_name"`
    ParentPhone          string     `json:"parentPhone" gorm:"column:parent_phone"`
    CreatedAt            time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
    UpdatedAt            time.Time  `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}
```

### Step 5: Update `backend/internal/domain/journal.go`
```go
type ClassJournal struct {
    ID                    string     `json:"id" gorm:"column:id;primaryKey"`
    SessionID             string     `json:"sessionId" gorm:"column:session_id"`
    ClassID               string     `json:"classId" gorm:"column:class_id;index;not null"`
    Class                 *Class     `json:"class,omitempty" gorm:"foreignKey:ClassID"`
    SubjectID             string     `json:"subjectId" gorm:"column:subject_id;index;not null"`
    Subject               *Subject   `json:"subject,omitempty" gorm:"foreignKey:SubjectID"`
    TeacherID             string     `json:"teacherId" gorm:"column:teacher_id;index;not null"`
    Teacher               *User      `json:"teacher,omitempty" gorm:"foreignKey:TeacherID"`
    TeacherName           string     `json:"teacherName" gorm:"column:teacher_name"`
    Date                  string     `json:"date" gorm:"column:date"`
    Period                string     `json:"period" gorm:"column:period"`
    MaterialTaught        string     `json:"materialTaught" gorm:"column:material_taught"`
    Achievements          string     `json:"achievements" gorm:"column:achievements"`
    ObstaclesAndSolutions string     `json:"obstaclesAndSolutions" gorm:"column:obstacles_and_solutions"`
    StudentBehaviorNotes  string     `json:"studentBehaviorNotes" gorm:"column:student_behavior_notes"`
    IncidentReport        string     `json:"incidentReport" gorm:"column:incident_report"`
    PresentCount          int        `json:"presentCount" gorm:"column:present_count"`
    AbsentCount           int        `json:"absentCount" gorm:"column:absent_count"`
    VerificationStatus    string     `json:"verificationStatus" gorm:"column:verification_status"`
    CreatedAt             time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}
```

### Step 6: Update `backend/internal/domain/syllabus.go`
```go
type SyllabusTopic struct {
    ID                   string      `json:"id" gorm:"column:id;primaryKey"`
    ClassID              string      `json:"classId" gorm:"column:class_id;index;not null"`
    Class                *Class      `json:"class,omitempty" gorm:"foreignKey:ClassID"`
    SubjectID            string      `json:"subjectId" gorm:"column:subject_id;index;not null"`
    Subject              *Subject    `json:"subject,omitempty" gorm:"foreignKey:SubjectID"`
    GradeLevel           string      `json:"gradeLevel" gorm:"column:grade_level"`
    Title                string      `json:"title" gorm:"column:title"`
    Chapter              string      `json:"chapter" gorm:"column:chapter"`
    CompetencyTarget     string      `json:"competencyTarget" gorm:"column:competency_target"`
    LearningObjectives   []string    `json:"learningObjectives" gorm:"column:learning_objectives;type:jsonb"`
    SubTopics            []SubTopic  `json:"subTopics" gorm:"column:sub_topics;type:jsonb"`
    ReferenceMaterials   []string    `json:"referenceMaterials" gorm:"column:reference_materials;type:jsonb"`
    CreatedAt            time.Time   `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}
```

### Step 7: Create `backend/internal/repository/subject_repository.go`
```go
package repository

type PostgresSubjectRepository struct {
    db *gorm.DB
}

func NewPostgresSubjectRepository(db *gorm.DB) *PostgresSubjectRepository {
    return &PostgresSubjectRepository{db: db}
}

func (r *PostgresSubjectRepository) Create(subject *domain.Subject) error {
    subject.ID = "subj-" + uuid.New().String()[:8]
    subject.CreatedAt = time.Now()
    return r.db.Create(subject).Error
}

func (r *PostgresSubjectRepository) GetByID(id string) (*domain.Subject, error) { ... }
func (r *PostgresSubjectRepository) GetByCode(code string) (*domain.Subject, error) { ... }
func (r *PostgresSubjectRepository) GetAll() ([]domain.Subject, error) { ... }
```

### Step 8: Create `backend/internal/repository/class_repository.go`
```go
package repository

type PostgresClassRepository struct {
    db *gorm.DB
}

func NewPostgresClassRepository(db *gorm.DB) *PostgresClassRepository {
    return &PostgresClassRepository{db: db}
}

func (r *PostgresClassRepository) Create(class *domain.Class) error {
    class.ID = "cls-" + uuid.New().String()[:8]
    class.CreatedAt = time.Now()
    class.UpdatedAt = time.Now()
    return r.db.Create(class).Error
}

func (r *PostgresClassRepository) GetByID(id string) (*domain.Class, error) { ... }
func (r *PostgresClassRepository) GetByCode(code string) (*domain.Class, error) { ... }
func (r *PostgresClassRepository) GetAllByTeacher(teacherID string) ([]domain.Class, error) { ... }
func (r *PostgresClassRepository) Update(class *domain.Class) error { ... }
func (r *PostgresClassRepository) Delete(id string) error { ... }
```

### Step 9: Create `backend/internal/repository/teacher_assignment_repository.go`
```go
package repository

type PostgresTeacherAssignmentRepository struct {
    db *gorm.DB
}

func NewPostgresTeacherAssignmentRepository(db *gorm.DB) *PostgresTeacherAssignmentRepository {
    return &PostgresTeacherAssignmentRepository{db: db}
}

func (r *PostgresTeacherAssignmentRepository) Upsert(assignment *domain.TeacherAssignment) error {
    assignment.ID = "asgn-" + uuid.New().String()[:8]
    return r.db.Clauses(clause.OnConflict{
        Columns: []clause.Column{
            {Name: "teacher_id"},
            {Name: "class_id"},
            {Name: "subject_id"},
            {Name: "day_of_week"},
            {Name: "start_time"},
            {Name: "end_time"},
        },
        DoUpdates: clause.AssignmentColumns([]string{"updated_at"}),
    }).Create(assignment).Error
}

func (r *PostgresTeacherAssignmentRepository) GetByTeacherAndTime(teacherID, dayOfWeek, currentTime string) (*domain.TeacherAssignment, error) {
    var assignment domain.TeacherAssignment
    err := r.db.Where("teacher_id = ? AND day_of_week = ? AND ? >= start_time AND ? < end_time", teacherID, dayOfWeek, currentTime, currentTime).First(&assignment).Error
    if err != nil {
        if err == gorm.ErrRecordNotFound {
            return nil, nil
        }
        return nil, err
    }
    return &assignment, nil
}

func (r *PostgresTeacherAssignmentRepository) GetAllByTeacher(teacherID string) ([]domain.TeacherAssignment, error) { ... }
func (r *PostgresTeacherAssignmentRepository) GetByClass(classID string) ([]domain.TeacherAssignment, error) { ... }
func (r *PostgresTeacherAssignmentRepository) Delete(id string) error { ... }
```

### Step 10: Update existing repositories with Preload
- `student_repository.go`: add `Preload("Class")` to `GetAllByClass`, `GetByID`
- `journal_repository.go`: add `Preload("Class")`, `Preload("Subject")`, `Preload("Teacher")`
- `syllabus_repository.go`: add `Preload("Class")`, `Preload("Subject")`

### Step 11: Create `backend/internal/service/subject_service.go`
```go
type SubjectService struct {
    subjectRepo *repository.PostgresSubjectRepository
}

func (s *SubjectService) Create(subject *domain.Subject) error
func (s *SubjectService) GetByID(id string) (*domain.Subject, error)
func (s *SubjectService) GetByCode(code string) (*domain.Subject, error)
func (s *SubjectService) GetAll() ([]domain.Subject, error)
```

### Step 12: Create `backend/internal/service/class_service.go`
```go
type ClassService struct {
    classRepo *repository.PostgresClassRepository
}

func (s *ClassService) Create(class *domain.Class) error
func (s *ClassService) GetByID(id string) (*domain.Class, error)
func (s *ClassService) GetByCode(code string) (*domain.Class, error)
func (s *ClassService) GetAllByTeacher(teacherID string) ([]domain.Class, error)
func (s *ClassService) Update(class *domain.Class) error
func (s *ClassService) Delete(id string) error
```

### Step 13: Create `backend/internal/service/teacher_assignment_service.go`
```go
type TeacherAssignmentService struct {
    assignmentRepo *repository.PostgresTeacherAssignmentRepository
}

func (s *TeacherAssignmentService) Upsert(assignment *domain.TeacherAssignment) error
func (s *TeacherAssignmentService) GetCurrentAssignment(teacherID string) (*domain.TeacherAssignment, error)
func (s *TeacherAssignmentService) GetAllByTeacher(teacherID string) ([]domain.TeacherAssignment, error)
func (s *TeacherAssignmentService) GetByClass(classID string) ([]domain.TeacherAssignment, error)
func (s *TeacherAssignmentService) Delete(id string) error
```

`GetCurrentAssignment` is the key method: it takes the authenticated teacher's ID, gets current day-of-week and time, and returns the active `TeacherAssignment` (or nil if no active slot).

### Step 14: Create handlers

`backend/internal/handler/subject_handler.go`:
- `CreateSubject`, `GetSubjects`, `GetSubjectByID`, `GetSubjectByCode`

`backend/internal/handler/class_handler.go`:
- `CreateClass`, `GetClasses`, `GetClassByID`, `GetClassByCode`, `UpdateClass`, `DeleteClass`, `GetClassesByTeacher`

`backend/internal/handler/teacher_assignment_handler.go`:
- `UpsertAssignment` (for admin service ingestion)
- `GetCurrentAssignment` (for teacher dashboard)
- `GetAssignmentsByTeacher`
- `GetAssignmentsByClass`
- `DeleteAssignment`

### Step 15: Update `backend/internal/db/migration.go`
- Add `&domain.Class{}`, `&domain.Subject{}`, `&domain.TeacherAssignment{}` to `AutoMigrate()`
- Seed `Subject` records (e.g., Matematika Lanjut, Fisika, Bahasa Indonesia)
- Seed `Class` record with `Code: "10-IPA-1"`, `Name: "Kelas 10 IPA 1"`, `TeacherID: "usr-teach-1"`
- Seed `TeacherAssignment` record linking teacher, class, and subject with a time slot
- Update seed `Student` records to reference new Class UUID
- Update seed `ClassJournal` to use Class UUID, SubjectID, and TeacherID
- Update seed `SyllabusTopic` to use Class UUID and SubjectID

### Step 16: Update `backend/cmd/api/main.go`
Wire all new handlers:
```go
// Subject routes
api.POST("/subjects", subjectHandler.CreateSubject)
api.GET("/subjects", subjectHandler.GetSubjects)
api.GET("/subjects/code/:code", subjectHandler.GetSubjectByCode)

// Class routes
api.POST("/classes", classHandler.CreateClass)
api.GET("/classes", classHandler.GetClasses)
api.GET("/classes/:id", classHandler.GetClassByID)
api.GET("/classes/code/:code", classHandler.GetClassByCode)
api.PUT("/classes/:id", classHandler.UpdateClass)
api.DELETE("/classes/:id", classHandler.DeleteClass)
api.GET("/classes/teacher/:teacherId", classHandler.GetClassesByTeacher)

// TeacherAssignment routes
api.POST("/assignments", assignmentHandler.UpsertAssignment) // for admin service
api.GET("/assignments/current", assignmentHandler.GetCurrentAssignment) // teacher's current slot
api.GET("/assignments/teacher/:teacherId", assignmentHandler.GetAssignmentsByTeacher)
api.GET("/assignments/class/:classId", assignmentHandler.GetAssignmentsByClass)
api.DELETE("/assignments/:id", assignmentHandler.DeleteAssignment)
```

## Frontend Implementation Steps

### Step 1: Update `frontend/src/types.ts`
```typescript
export interface Subject {
  id: string;
  code: string;
  name: string;
  createdAt?: string;
}

export interface Class {
  id: string;
  code: string;
  name: string;
  gradeLevel: string;
  teacherId: string;
  academicYear: string;
  createdAt?: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
}

export type ClassId = string;
export type SubjectId = string;

// Update existing entities
export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  avatar: string;
  classId: ClassId;
  class?: Class;
  attendanceHistoryRate: number;
  parentName: string;
  parentPhone: string;
}

export interface ClassJournal {
  id: string;
  sessionId: string;
  classId: ClassId;
  class?: Class;
  subjectId: SubjectId;
  subject?: Subject;
  teacherId: string;
  teacher?: UserSession;
  teacherName: string;
  // ... rest unchanged
}

export interface SyllabusTopic {
  id: string;
  classId?: ClassId;
  class?: Class;
  subjectId: string;
  subject?: Subject;
  // ... rest unchanged
}
```

### Step 2: Update `frontend/src/data/initialData.ts`
- Add `INITIAL_SUBJECTS`
- Add `INITIAL_CLASSES`
- Add `INITIAL_ASSIGNMENTS`
- Update existing seed data references

### Step 3: Update `frontend/src/data/localDataSource.ts`
- Add CRUD methods for `Subject`, `Class`, `TeacherAssignment`
- Add `getCurrentAssignment(teacherId: string)` helper

### Step 4: Update frontend components
- `HeaderBar.tsx`: populate class selector from `LocalDataSource.getClasses()`
- Dashboard/sesi view: use `getCurrentAssignment` to show "Current Class: 10-IPA-1 Matematika"
- Any component using `classId` or `subject` strings should use IDs and preload related entities

## API Contract Changes

### Breaking changes
- `GET /students?classId=` expects UUID
- `GET /journals?classId=` expects UUID
- `GET /syllabus?classId=` expects UUID
- Frontend `ClassId` type changes from union to `string`

### New endpoints
- `POST /api/v1/subjects`
- `GET /api/v1/subjects`
- `GET /api/v1/subjects/code/:code`

- `POST /api/v1/classes`
- `GET /api/v1/classes`
- `GET /api/v1/classes/:id`
- `GET /api/v1/classes/code/:code`
- `PUT /api/v1/classes/:id`
- `DELETE /api/v1/classes/:id`
- `GET /api/v1/classes/teacher/:teacherId`

- `POST /api/v1/assignments` (admin service ingestion)
- `GET /api/v1/assignments/current` (teacher's current active slot)
- `GET /api/v1/assignments/teacher/:teacherId`
- `GET /api/v1/assignments/class/:classId`
- `DELETE /api/v1/assignments/:id`

## TeacherAssignment Use Case: "What am I teaching now?"

The frontend dashboard can call `GET /api/v1/assignments/current?teacherId=<currentTeacherId>` on load. The backend handler:
1. Gets current day-of-week and time from request context or server time
2. Queries `TeacherAssignmentRepository.GetByTeacherAndTime(teacherID, dayOfWeek, currentTime)`
3. Preloads `Class` and `Subject` on the returned assignment
4. Returns the active assignment with full class and subject details

If no assignment matches, returns empty — the dashboard shows "No active class right now."

## Validation Plan

1. `go test ./...` — ensure no compile errors
2. `db.AutoMigrate()` creates `classes`, `subjects`, `teacher_assignments` tables with FK constraints
3. `POST /api/v1/subjects` creates a subject
4. `POST /api/v1/classes` creates a class with UUID and TeacherID FK
5. `POST /api/v1/assignments` creates an assignment with teacher, class, and subject FKs
6. `GET /api/v1/assignments/current` returns active assignment when time matches slot
7. `GET /students?classId=<uuid>` returns students with preloaded `Class`
8. `POST /journals` with `classId`, `subjectId`, `teacherId` saves journal with FK relationships
9. Frontend loads classes, subjects, assignments; dashboard shows current teaching context
