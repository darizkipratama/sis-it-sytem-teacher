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
  UserSession
} from '../types';
import { LocalDataSource } from '../data/localDataSource';
import { EventService } from '../services/eventService';
import { AttendanceService } from '../services/attendanceService';
import { JournalService } from '../services/journalService';
import { AnnouncementService } from '../services/announcementService';
import { AssessmentService } from '../services/assessmentService';

const AUTH_USER_KEY = 'ihsan_auth_user_v1';

export const getStoredUser = (): UserSession | null => {
  const data = localStorage.getItem(AUTH_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveUserSession = (user: UserSession): void => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearUserSession = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
};

// Synchronous legacy getters for initial render or direct local state initializers
export const getStoredStudents = (): Student[] => {
  const data = localStorage.getItem('ihsan_students_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_students_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredSessions = (): ClassSession[] => {
  const data = localStorage.getItem('ihsan_sessions_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_sessions_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredSyllabus = (): SyllabusTopic[] => {
  const data = localStorage.getItem('ihsan_syllabus_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_syllabus_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredAnnouncements = (): Announcement[] => {
  const data = localStorage.getItem('ihsan_announcements_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_announcements_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredAssessments = (): AssessmentItem[] => {
  const data = localStorage.getItem('ihsan_assessments_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_assessments_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredGrades = (): StudentGrade[] => {
  const data = localStorage.getItem('ihsan_grades_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_grades_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredJournals = (): ClassJournal[] => {
  const data = localStorage.getItem('ihsan_journals_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_journals_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem('ihsan_attendance_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_attendance_v1');
  return v1 ? JSON.parse(v1) : [];
};

export const getStoredAsyncEvents = (): AsyncMessageEvent[] => {
  const data = localStorage.getItem('ihsan_async_events_v2');
  if (data) return JSON.parse(data);
  const v1 = localStorage.getItem('ihsan_async_events_v1');
  return v1 ? JSON.parse(v1) : [];
};

// Delegated Service methods
export const saveAttendanceRecords = (records: AttendanceRecord[]) => {
  AttendanceService.saveAttendanceRecords(records);
};

export const saveJournalEntry = (journal: ClassJournal) => {
  JournalService.saveJournal(journal);
};

export const addAnnouncement = (newAnn: Announcement) => {
  AnnouncementService.addAnnouncement(newAnn);
};

export const saveGrades = (assessmentId: string, grades: StudentGrade[]) => {
  AssessmentService.saveGrades(assessmentId, grades);
};

export const createAssessment = (newAss: AssessmentItem) => {
  AssessmentService.createAssessment(newAss);
};

export const pushAsyncEvent = (topic: string, eventType: string, payload: any) => {
  EventService.publishEvent(topic, eventType, payload);
};

export const resetAllData = () => {
  localStorage.clear();
};
