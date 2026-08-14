import {
  Student,
  ClassSession,
  SyllabusTopic,
  Announcement,
  AssessmentItem,
  StudentGrade,
  ClassJournal,
  AttendanceRecord,
  AsyncMessageEvent,
  Subject,
  Class,
  TeacherAssignment
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_SYLLABUS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_GRADES,
  INITIAL_JOURNAL,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_ASSIGNMENTS
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
  ASYNC_EVENTS: 'ihsan_async_events_v2',
  SUBJECTS: 'ihsan_subjects_v2',
  CLASSES: 'ihsan_classes_v2',
  ASSIGNMENTS: 'ihsan_assignments_v2'
};

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

  // Subjects
  public static async getSubjects(): Promise<Subject[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : INITIAL_SUBJECTS;
  }

  public static async saveSubjects(subjects: Subject[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  // Classes
  public static async getClasses(): Promise<Class[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return data ? JSON.parse(data) : INITIAL_CLASSES;
  }

  public static async saveClasses(classes: Class[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  public static async getClassById(id: string): Promise<Class | undefined> {
    const classes = await this.getClasses();
    return classes.find(c => c.id === id);
  }

  public static async getClassByCode(code: string): Promise<Class | undefined> {
    const classes = await this.getClasses();
    return classes.find(c => c.code === code);
  }

  public static async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    const classes = await this.getClasses();
    return classes.filter(c => c.teacherId === teacherId);
  }

  // Teacher Assignments
  public static async getAssignments(): Promise<TeacherAssignment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return data ? JSON.parse(data) : INITIAL_ASSIGNMENTS;
  }

  public static async saveAssignments(assignments: TeacherAssignment[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }

  public static async getAssignmentsByTeacher(teacherId: string): Promise<TeacherAssignment[]> {
    const assignments = await this.getAssignments();
    return assignments.filter(a => a.teacherId === teacherId);
  }

  public static async getAssignmentsByClass(classId: string): Promise<TeacherAssignment[]> {
    const assignments = await this.getAssignments();
    return assignments.filter(a => a.classId === classId);
  }

  public static async getCurrentAssignment(teacherId: string): Promise<TeacherAssignment | undefined> {
    const assignments = await this.getAssignmentsByTeacher(teacherId);
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ...
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    return assignments.find(a => {
      const assignmentDay = new Date(a.dayOfWeek + ', 2000-01-01').getDay();
      if (assignmentDay !== dayOfWeek) return false;
      return currentTime >= a.startTime && currentTime < a.endTime;
    });
  }
}
