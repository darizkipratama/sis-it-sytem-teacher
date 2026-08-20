# Backend Entities

The backend is a Go application (GORM + PostgreSQL). All entities are defined in `backend/internal/domain/` and auto-migrated into the database by `backend/internal/db/migration.go`.

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ CLASS : "owns as homeroom"
    CLASS ||--o{ STUDENT : "contains"
    CLASS ||--o{ CLASS_JOURNAL : "has journals"
    CLASS ||--o{ SYLLABUS_TOPIC : "has syllabus"
    CLASS ||--o{ TEACHER_ASSIGNMENT : "scheduled for"
    SUBJECT ||--o{ TEACHER_ASSIGNMENT : "assigned as"
    SUBJECT ||--o{ CLASS_JOURNAL : "taught"
    SUBJECT ||--o{ SYLLABUS_TOPIC : "covered by"
    USER ||--o{ CLASS_JOURNAL : "writes"
    USER ||--o{ TEACHER_ASSIGNMENT : "teaches"

    USER {
        string id PK
        string nip UK "teacher/staff no."
        string name
        string title "e.g. Kepala Sekolah"
        string role "headmaster | teacher"
        string email UK
        string password_hash "bcrypt"
        string avatar
    }

    CLASS {
        string id PK
        string code UK "e.g. 10-IPA-1"
        string name
        string grade_level "Kelas X / XI"
        string teacher_id FK "homeroom teacher"
        string academic_year "2024/2025"
    }

    STUDENT {
        string id PK
        string nis UK "student no."
        string name
        string gender
        string avatar
        string class_id FK
        int attendance_history_rate
        string parent_name
        string parent_phone
    }

    SUBJECT {
        string id PK
        string code UK "e.g. MTK-LANJUT"
        string name
    }

    TEACHER_ASSIGNMENT {
        string id PK
        string teacher_id FK
        string class_id FK
        string subject_id FK
        string day_of_week "Monday..."
        string start_time "07:30"
        string end_time "09:00"
    }

    CLASS_JOURNAL {
        string id PK
        string session_id "active class session"
        string class_id FK
        string subject_id FK
        string teacher_id FK
        string teacher_name
        string date
        string period
        string material_taught
        string achievements
        string obstacles_and_solutions
        string student_behavior_notes
        string incident_report
        int present_count
        int absent_count
        string verification_status "headmaster approval"
    }

    SYLLABUS_TOPIC {
        string id PK
        string class_id FK
        string subject_id FK
        string grade_level
        string title
        string chapter
        string competency_target
        jsonb learning_objectives "[]string"
        jsonb sub_topics "[]SubTopic{completed}"
        jsonb reference_materials "[]string"
    }
```

## Tables

| Entity | File | PK / UK | Foreign Keys |
| ------ | ---- | ------- | ------------ |
| `User` | `internal/domain/user.go` | `id` PK, `nip` UK, `email` UK | `Classes` (has many, via `TeacherID`) |
| `Class` | `internal/domain/class.go` | `id` PK, `code` UK | `TeacherID` → `User` |
| `Student` | `internal/domain/student.go` | `id` PK, `nis` UK | `ClassID` → `Class` |
| `Subject` | `internal/domain/subject.go` | `id` PK, `code` UK | — |
| `TeacherAssignment` | `internal/domain/teacher_assignment.go` | `id` PK | `TeacherID`, `ClassID`, `SubjectID` |
| `ClassJournal` | `internal/domain/journal.go` | `id` PK | `ClassID`, `SubjectID`, `TeacherID` |
| `SyllabusTopic` | `internal/domain/syllabus.go` | `id` PK | `ClassID`, `SubjectID` |

## Business flow

1. **Scheduling → Session:** A `TeacherAssignment` (who teaches what, where, when) defines the timetable. When a teacher acts during a live slot, it creates a `SessionID` for a `ClassJournal`.
2. **Teaching:** `ClassJournal` captures *what happened* in class — material, achievements, obstacles, behavior, incidents, and attendance counts.
3. **Verification:** Headmaster checks `verification_status` on journals to approve them.
4. **Curriculum:** `SyllabusTopic` holds the plan (objectives, chapters, subtopics) per class+subject; subtopics track `completed` progress.
5. **Roles:** `User` with `role=headmaster` vs `role=teacher` gates what each side can see/do (journal write vs. approve).

## Supporting types (not tables)

- `AsyncMessageEvent` + `QueuePublisher` (`internal/domain/event.go`) — envelope used by the RabbitMQ/Supabase queue for async events.
- `JSONStringSlice` / `JSONSubTopicSlice` (`internal/domain/syllabus.go`) — custom JSON `driver.Valuer`/`sql.Scanner` types for `jsonb` columns.
