export type ClassId = '10-IPA-1' | '10-IPA-2' | '11-MIPA-3';

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat';

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  avatar: string;
  classId: ClassId;
  attendanceHistoryRate: number; // percentage
  parentName: string;
  parentPhone: string;
}

export type GradeType = 'Ujian' | 'Evaluasi Harian' | 'Proyek' | 'Kuis';

export interface AssessmentItem {
  id: string;
  title: string;
  type: GradeType;
  classId: ClassId;
  subject: string;
  date: string;
  maxScore: number;
  weight: number; // percentage in final report
}

export interface StudentGrade {
  studentId: string;
  assessmentId: string;
  score: number;
  notes?: string;
}

export interface ClassSession {
  id: string;
  classId: ClassId;
  subject: string;
  topic: string;
  room: string;
  period: string; // e.g. "Jam 03 - 04 (09:00 - 10:30)"
  startTime?: string;
  endTime?: string;
  status: 'Belum Dimulai' | 'Berlangsung' | 'Selesai';
  date: string;
}

export interface ClassJournal {
  id: string;
  sessionId: string;
  classId: ClassId;
  subject: string;
  date: string;
  period?: string;
  materialTaught: string;
  achievements: string;
  obstaclesAndSolutions: string;
  studentBehaviorNotes: string;
  incidentReport?: string; // Berita acara kejadian khusus kelas
  presentCount?: number;
  absentCount?: number;
  verificationStatus?: 'Draft' | 'Disahkan Headmaster' | 'Selesai';
  photoUrl?: string;
  teacherName: string;
  createdAt?: string;
}

export interface SyllabusTopic {
  id: string;
  classId?: ClassId;
  subject: string;
  gradeLevel: string;
  title: string;
  chapter: string;
  competencyTarget: string;
  learningObjectives: string[];
  subTopics: {
    id: string;
    title: string;
    completed: boolean;
    recommendedDuration: string;
  }[];
  referenceMaterials: string[];
  semester?: string;
  allocatedSessions?: number;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  classId: ClassId;
  title: string;
  content: string;
  category: 'Penting/Urgent' | 'Pengumuman Umum' | 'Tugas & Ujian' | 'Kegiatan Sekolah';
  createdAt: string;
  authorRole: string; // e.g. "Wali Kelas 10 IPA 1"
  sendToWhatsapp: boolean;
  parentReadCount: number;
  totalParents: number;
  attachments?: string[];
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  sessionId: string;
  status: AttendanceStatus;
  note?: string;
  recordedAt: string;
}

export interface AsyncMessageEvent {
  id: string;
  timestamp: string;
  topic: string; // e.g. "ihsancloud.attendance.event"
  eventType: string; // e.g. "ATTENDANCE_RECORDED"
  payload: any;
  status: 'PENDING_RABBITMQ' | 'DISPATCHED_TO_GO_SERVICE' | 'SUPABASE_REALTIME_SYNCED';
  attempts: number;
}
