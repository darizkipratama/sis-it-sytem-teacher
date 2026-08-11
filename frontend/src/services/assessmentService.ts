import { BaseService, ServiceResponse } from './baseService';
import { AssessmentItem, StudentGrade, ClassId } from '../types';
import { LocalDataSource } from '../data/localDataSource';
import { EventService } from './eventService';

export class AssessmentService extends BaseService {
  public static async getAssessments(classId?: ClassId): Promise<ServiceResponse<AssessmentItem[]>> {
    try {
      const items = await LocalDataSource.getAssessments();
      const filtered = classId ? items.filter((a) => a.classId === classId) : items;
      return this.createSuccess(filtered);
    } catch (err) {
      return this.createError('Gagal memuat item penilaian', err);
    }
  }

  public static async getGrades(): Promise<ServiceResponse<StudentGrade[]>> {
    try {
      const grades = await LocalDataSource.getGrades();
      return this.createSuccess(grades);
    } catch (err) {
      return this.createError('Gagal memuat nilai siswa', err);
    }
  }

  public static async createAssessment(
    newAss: Omit<AssessmentItem, 'id'>
  ): Promise<ServiceResponse<AssessmentItem>> {
    try {
      const list = await LocalDataSource.getAssessments();
      const created: AssessmentItem = {
        ...newAss,
        id: `ass-${Date.now()}`
      };

      const updated = [created, ...list];
      await LocalDataSource.saveAssessments(updated);

      await EventService.publishEvent('ihsancloud.academic.exchange', 'ASSESSMENT_CREATED', {
        id: created.id,
        type: created.type,
        title: created.title,
        classId: created.classId
      });

      return this.createSuccess(created, 'Penilaian Baru Berhasil Dibuat');
    } catch (err) {
      return this.createError('Gagal membuat item penilaian', err);
    }
  }

  public static async saveGrades(
    assessmentId: string,
    grades: StudentGrade[]
  ): Promise<ServiceResponse<void>> {
    try {
      const allGrades = await LocalDataSource.getGrades();
      const filtered = allGrades.filter((g) => g.assessmentId !== assessmentId);
      const updated = [...filtered, ...grades];

      await LocalDataSource.saveGrades(updated);

      const avgScore = Math.round(grades.reduce((a, b) => a + b.score, 0) / (grades.length || 1));
      await EventService.publishEvent('ihsancloud.academic.exchange', 'GRADE_BATCH_SAVED', {
        assessmentId,
        gradedCount: grades.length,
        averageScore: avgScore
      });

      return this.createSuccess(undefined, 'Nilai siswa berhasil disimpan');
    } catch (err) {
      return this.createError('Gagal menyimpan nilai', err);
    }
  }
}
