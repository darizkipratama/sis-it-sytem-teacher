# IhsanCloud Backend Go (Monorepo Architecture)

Modul Backend terpisah dalam struktur **Monorepo** menggunakan bahasa pemrograman **Go (Golang)**, arsitektur Clean Architecture / DDD (Domain-Driven Design), dan terintegrasi dengan Message Queue (**RabbitMQ** dan **Supabase Async Realtime Queue**).

---

## 📁 Struktur Monorepo Project

```text
.
├── backend/                             # Core Go Backend Service
│   ├── cmd/
│   │   └── api/
│   │       └── main.go                  # HTTP Server Entry Point (Gin Framework)
│   ├── internal/
│   │   ├── domain/                      # Domain Entities & Repository Interfaces
│   │   │   ├── journal.go               # Entity Berita Acara & Jurnal Pengajaran
│   │   │   ├── syllabus.go              # Entity Silabus & Rencana Ajar
│   │   │   └── event.go                 # Entity Async Queue Event
│   │   ├── handler/                     # HTTP Handlers / Controllers
│   │   │   ├── journal_handler.go
│   │   │   └── syllabus_handler.go
│   │   ├── queue/                       # Message Queue Adapters (RabbitMQ / Supabase)
│   │   │   ├── rabbitmq.go              # RabbitMQ Producer & Exchange Manager
│   │   │   └── supabase_queue.go        # Supabase Realtime Queue Event Dispatcher
│   │   └── repository/                  # Data Access Layer Implementation
│   │       ├── journal_repository.go
│   │       └── syllabus_repository.go
│   ├── go.mod
│   └── README.md
├── src/                                 # Frontend React + TypeScript App
├── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan Backend Go

### Prerequisites
- Go 1.22+
- RabbitMQ (Opsional, server otomatis menggunakan *fallback mode* jika RabbitMQ belum berjalan)

### Langkah Jalankan:
```bash
cd backend

# Download dependencies
go mod download

# Run local development server
go run cmd/api/main.go
```

Server HTTP Go akan berjalan pada `http://localhost:8080`.

---

## ⚡ Integration Queue System

Backend ini disiapkan untuk mendukung sistem pengiriman pesan asynchronous:
1. **RabbitMQ Exchange (`ihsancloud.journal.exchange`)**:
   - Mempublikasikan event saat guru menyimpan Berita Acara / Jurnal Pengajaran (`journal.created`).
   - Mempublikasikan event saat Kepala Sekolah/Headmaster memverifikasi jurnal (`journal.verified`).
   - Mempublikasikan Rencana Ajar baru (`syllabus.created`).

2. **Supabase Realtime Queue (`pgmq / async_events`)**:
   - Mendispatch payload event secara real-time ke tabel event queue Supabase untuk dikonsumsi frontend atau notification gateway (WhatsApp/SMS).

---

## 📡 REST API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Healthcheck server & status antrean |
| `GET` | `/api/v1/journals?classId=10-IPA-1` | Mengambil daftar Berita Acara / Jurnal |
| `POST` | `/api/v1/journals` | Menyimpan Berita Acara Pengajaran Baru |
| `PUT` | `/api/v1/journals/:id/verify` | Memverifikasi Berita Acara oleh Wali Kelas / Headmaster |
| `GET` | `/api/v1/syllabus?classId=10-IPA-1` | Mengambil daftar Silabus & Rencana Ajar |
| `POST` | `/api/v1/syllabus` | Menambahkan Rencana Ajar Baru |
| `PATCH` | `/api/v1/syllabus/:id/subtopics/:subId` | Mengubah status checklist sub-topik silabus |
