import { BaseService, ServiceResponse } from './baseService';
import { AttendanceRecord, Student, ClassId } from '../types';
import { LocalDataSource } from '../data/localDataSource';
import { EventService } from './eventService';

export class AttendanceService extends BaseService {
  public static async getAttendanceRecords(): Promise<ServiceResponse<AttendanceRecord[]>> {
    try {
      const records = await LocalDataSource.getAttendance();
      return this.createSuccess(records);
    } catch (err) {
      return this.createError('Gagal mengambil data absensi', err);
    }
  }

  public static async saveAttendanceRecords(
    records: AttendanceRecord[]
  ): Promise<ServiceResponse<void>> {
    try {
      const current = await LocalDataSource.getAttendance();
      const recordMap = new Map<string, AttendanceRecord>();
      current.forEach((r) => r && recordMap.set(`${r.studentId}-${r.sessionId}-${r.date}`, r));
      records.forEach((r) => r && recordMap.set(`${r.studentId}-${r.sessionId}-${r.date}`, r));

      const updatedList = Array.from(recordMap.values());
      await LocalDataSource.saveAttendance(updatedList);

      await EventService.publishEvent('ihsancloud.attendance.exchange', 'ATTENDANCE_BATCH_SAVED', {
        sessionId: records[0]?.sessionId || 'ses-101',
        recordCount: records.length,
        timestamp: new Date().toISOString(),
        summary: records.map((r) => ({ id: r?.studentId, status: r?.status || 'Hadir' }))
      });

      return this.createSuccess(undefined, 'Absensi siswa berhasil tersimpan & tersinkronisasi');
    } catch (err) {
      return this.createError('Gagal menyimpan presensi siswa', err);
    }
  }

  public static async getStudentsByClass(classId: ClassId): Promise<ServiceResponse<Student[]>> {
    try {
      const all = await LocalDataSource.getStudents();
      const filtered = all.filter((s) => s.classId === classId);
      return this.createSuccess(filtered);
    } catch (err) {
      return this.createError('Gagal memuat daftar siswa', err);
    }
  }
}
