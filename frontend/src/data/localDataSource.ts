import {
  Student,
  ClassSession,
  SyllabusTopic,
  Announcement,
  AssessmentItem,
  StudentGrade,
  ClassJournal,
  AttendanceRecord,
  AsyncMessageEvent
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_SYLLABUS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_GRADES,
  INITIAL_JOURNAL
} from './initialData';

const STORAGE_KEYS = {
  STUDENTS: 'ihsan_students_v2',
  SESSIONS: 'ihsan_sessions_v2',
  SYLLABUS: 'ihsan_syllabus_v2',
  ANNOUNCEMENTS: 'ihsan_announcements_v2',
  ASSESSMENTS: 'ihsan_assessments_v2',
  GRADES: 'ihsan_grades_v2',
  JOURNALS: 'ihsan_journals_v2',
  ATTENDANCE: 'ihsan_attendance_v2',
  ASYNC_EVENTS: 'ihsan_async_events_v2'
};

/**
 * Data Access Layer (Repository Pattern)
 * Encapsulates raw data operations. Ready to be replaced or plugged into Axios/Fetch/Supabase backend client.
 */
export class LocalDataSource {
  // Students
  public static async getStudents(): Promise<Student[]> {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  }

  public static async saveStudents(students: Student[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  // Class Sessions
  public static async getSessions(): Promise<ClassSession[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : INITIAL_SESSIONS;
  }

  public static async saveSessions(sessions: ClassSession[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  // Syllabus & Rencana Ajar
  public static async getSyllabus(): Promise<SyllabusTopic[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SYLLABUS);
    return data ? JSON.parse(data) : INITIAL_SYLLABUS;
  }

  public static async saveSyllabus(syllabus: SyllabusTopic[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(syllabus));
  }

  // Announcements
  public static async getAnnouncements(): Promise<Announcement[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
  }

  public static async saveAnnouncements(announcements: Announcement[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }

  // Assessments
  public static async getAssessments(): Promise<AssessmentItem[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    return data ? JSON.parse(data) : INITIAL_ASSESSMENTS;
  }

  public static async saveAssessments(assessments: AssessmentItem[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  }

  // Grades
  public static async getGrades(): Promise<StudentGrade[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GRADES);
    return data ? JSON.parse(data) : INITIAL_GRADES;
  }

  public static async saveGrades(grades: StudentGrade[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  }

  // Class Journals / Berita Acara Pengajaran
  public static async getJournals(): Promise<ClassJournal[]> {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    return data ? JSON.parse(data) : [INITIAL_JOURNAL];
  }

  public static async saveJournals(journals: ClassJournal[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
  }

  // Attendance
  public static async getAttendance(): Promise<AttendanceRecord[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  }

  public static async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  }

  // Async Events (RabbitMQ & Supabase Event Queue)
  public static async getAsyncEvents(): Promise<AsyncMessageEvent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ASYNC_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  public static async saveAsyncEvents(events: AsyncMessageEvent[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ASYNC_EVENTS, JSON.stringify(events));
  }
}
