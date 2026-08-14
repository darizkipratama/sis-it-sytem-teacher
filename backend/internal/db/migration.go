package db

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&domain.User{},
		&domain.Subject{},
		&domain.Class{},
		&domain.TeacherAssignment{},
		&domain.ClassJournal{},
		&domain.SyllabusTopic{},
		&domain.Student{},
	)
	if err != nil {
		return err
	}

	if err := seedInitialData(db); err != nil {
		return err
	}

	log.Println("Database migration completed successfully")
	return nil
}

func seedInitialData(db *gorm.DB) error {
	var userCount int64
	db.Model(&domain.User{}).Count(&userCount)
	if userCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("guru123"), bcrypt.DefaultCost)
		users := []domain.User{
			{
				ID:           "usr-head-1",
				NIP:          "198804122015031001",
				Name:         "Dr. Siti Aminah, M.Pd",
				Title:        "Kepala Sekolah",
				Role:         "headmaster",
				Email:        "kepsek@sekolanihsan.sch.id",
				PasswordHash: string(hashedPassword),
				Avatar:       "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			{
				ID:           "usr-teach-1",
				NIP:          "198804122015031002",
				Name:         "Pak Ihsan Cloud, S.Pd",
				Title:        "Guru Matematika Lanjut & Fisika",
				Role:         "teacher",
				Email:        "ihsan.cloud@sekolanihsan.sch.id",
				PasswordHash: string(hashedPassword),
				Avatar:       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
		}
		if err := db.Create(&users).Error; err != nil {
			return err
		}
		log.Println("Seed users inserted")
	}

	var subjectCount int64
	db.Model(&domain.Subject{}).Count(&subjectCount)
	if subjectCount == 0 {
		subjects := []domain.Subject{
			{ID: "subj-1", Code: "MTK-LANJUT", Name: "Matematika Lanjut", CreatedAt: time.Now()},
			{ID: "subj-2", Code: "FISIKA", Name: "Fisika", CreatedAt: time.Now()},
			{ID: "subj-3", Code: "BINDO", Name: "Bahasa Indonesia", CreatedAt: time.Now()},
		}
		if err := db.Create(&subjects).Error; err != nil {
			return err
		}
		log.Println("Seed subjects inserted")
	}

	var classCount int64
	db.Model(&domain.Class{}).Count(&classCount)
	if classCount == 0 {
		classes := []domain.Class{
			{ID: "cls-1", Code: "10-IPA-1", Name: "Kelas 10 IPA 1", GradeLevel: "Kelas X", TeacherID: "usr-teach-1", AcademicYear: "2024/2025", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "cls-2", Code: "10-IPA-2", Name: "Kelas 10 IPA 2", GradeLevel: "Kelas X", TeacherID: "usr-teach-1", AcademicYear: "2024/2025", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "cls-3", Code: "11-MIPA-3", Name: "Kelas 11 MIPA 3", GradeLevel: "Kelas XI", TeacherID: "usr-teach-1", AcademicYear: "2024/2025", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		}
		if err := db.Create(&classes).Error; err != nil {
			return err
		}
		log.Println("Seed classes inserted")
	}

	var assignmentCount int64
	db.Model(&domain.TeacherAssignment{}).Count(&assignmentCount)
	if assignmentCount == 0 {
		assignments := []domain.TeacherAssignment{
			{ID: "asgn-1", TeacherID: "usr-teach-1", ClassID: "cls-1", SubjectID: "subj-1", DayOfWeek: "Monday", StartTime: "07:30", EndTime: "09:00", CreatedAt: time.Now()},
			{ID: "asgn-2", TeacherID: "usr-teach-1", ClassID: "cls-1", SubjectID: "subj-2", DayOfWeek: "Tuesday", StartTime: "09:30", EndTime: "11:00", CreatedAt: time.Now()},
			{ID: "asgn-3", TeacherID: "usr-teach-1", ClassID: "cls-2", SubjectID: "subj-1", DayOfWeek: "Wednesday", StartTime: "07:30", EndTime: "09:00", CreatedAt: time.Now()},
		}
		if err := db.Create(&assignments).Error; err != nil {
			return err
		}
		log.Println("Seed teacher assignments inserted")
	}

	var journalCount int64
	db.Model(&domain.ClassJournal{}).Count(&journalCount)
	if journalCount == 0 {
		seedJournal := domain.ClassJournal{
			ID:                    "jour-101",
			SessionID:             "ses-101",
			ClassID:               "cls-1",
			SubjectID:             "subj-1",
			TeacherID:             "usr-teach-1",
			TeacherName:           "Pak Ihsan Cloud, S.Pd",
			Date:                  time.Now().Format("2006-01-02"),
			Period:                "Jam 01 - 02 (07.30 - 09.00 WIB)",
			MaterialTaught:        "Konsep Vektor 3D, Dot Product & Sudut Orthogonal.",
			Achievements:          "85% siswa menguasai perhitungan sudut vektor 3D.",
			ObstaclesAndSolutions: "3 siswa butuh bimbingan sumbu Z.",
			StudentBehaviorNotes:  "Sangat kondusif dan aktif berdiskusi.",
			IncidentReport:        "Kelas berjalan sesuai jadwal tanpa hambatan.",
			PresentCount:          26,
			AbsentCount:           2,
			VerificationStatus:    "Disahkan Headmaster",
			CreatedAt:             time.Now(),
		}
		if err := db.Create(&seedJournal).Error; err != nil {
			return err
		}
		log.Println("Seed journal inserted")
	}

	var syllabusCount int64
	db.Model(&domain.SyllabusTopic{}).Count(&syllabusCount)
	if syllabusCount == 0 {
		seedSyllabus := domain.SyllabusTopic{
			ID:                 "syl-1",
			ClassID:            "cls-1",
			SubjectID:          "subj-1",
			GradeLevel:         "Kelas X Semester 2",
			Title:              "Vektor & Operasi Aljabar 3D",
			Chapter:            "Bab 4",
			CompetencyTarget:   "Siswa mampu menganalisis proyeksi vektor dan sudut orthogonal.",
			LearningObjectives: domain.JSONStringSlice{"Memahami penjumlahan vektor", "Perhitungan dot product 3D"},
			SubTopics: domain.JSONSubTopicSlice{
				{ID: "st-1", Title: "Definisi Vektor & Notasi Komponen", Completed: true, RecommendedDuration: "45 Menit"},
				{ID: "st-2", Title: "Operasi Vektor & Dot Product", Completed: false, RecommendedDuration: "45 Menit"},
			},
			ReferenceMaterials: domain.JSONStringSlice{"Buku Panduan Guru Kurikulum Merdeka"},
			CreatedAt:          time.Now(),
		}
		if err := db.Create(&seedSyllabus).Error; err != nil {
			return err
		}
		log.Println("Seed syllabus inserted")
	}

	var studentCount int64
	db.Model(&domain.Student{}).Count(&studentCount)
	if studentCount == 0 {
		students := []domain.Student{
			{ID: "s1", NIS: "20241001", Name: "Ahmad Raihan Pratama", Gender: "L", ClassID: "cls-1", AttendanceHistoryRate: 98, ParentName: "Bpk. Hendra Pratama", ParentPhone: "081234567801", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "s2", NIS: "20241002", Name: "Aisyah Anindya Putri", Gender: "P", ClassID: "cls-1", AttendanceHistoryRate: 100, ParentName: "Ibu Ratna Juwita", ParentPhone: "081234567802", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "s3", NIS: "20241003", Name: "Bagus Dewantara", Gender: "L", ClassID: "cls-1", AttendanceHistoryRate: 92, ParentName: "Bpk. Bambang Dewa", ParentPhone: "081234567803", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "s4", NIS: "20241004", Name: "Citra Kirana Maya", Gender: "P", ClassID: "cls-1", AttendanceHistoryRate: 96, ParentName: "Ibu Maya Lestari", ParentPhone: "081234567804", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "s5", NIS: "20241005", Name: "Daffa Rizky Ramadhan", Gender: "L", ClassID: "cls-1", AttendanceHistoryRate: 95, ParentName: "Bpk. Syarif Ramadhan", ParentPhone: "081234567805", CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: "s6", NIS: "20241006", Name: "Fadhil Ihsan Naufal", Gender: "L", ClassID: "cls-1", AttendanceHistoryRate: 97, ParentName: "Bpk. Naufal Ihsan", ParentPhone: "081234567806", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		}
		if err := db.Create(&students).Error; err != nil {
			return err
		}
		log.Println("Seed students inserted")
	}

	return nil
}
