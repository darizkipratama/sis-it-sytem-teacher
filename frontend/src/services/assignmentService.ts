import { BaseService, ServiceResponse } from './baseService';
import { TeacherAssignment, Class, Subject } from '../types';

export class AssignmentService extends BaseService {
  public static async getAssignmentsByTeacherAndDay(
    teacherId: string,
    dayOfWeek: string
  ): Promise<ServiceResponse<TeacherAssignment[]>> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: TeacherAssignment[] }>(
        `/assignments/teacher/${teacherId}/day/${dayOfWeek}`
      );

      if (response.success && response.data) {
        return this.createSuccess(response.data);
      }
      return this.createSuccess([]);
    } catch (err) {
      return this.createError('Gagal memuat jadwal mengajar', err);
    }
  }

  public static async getAssignmentsByTeacher(
    teacherId: string
  ): Promise<ServiceResponse<TeacherAssignment[]>> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: TeacherAssignment[] }>(
        `/assignments/teacher/${teacherId}`
      );

      if (response.success && response.data) {
        return this.createSuccess(response.data);
      }
      return this.createSuccess([]);
    } catch (err) {
      return this.createError('Gagal memuat jadwal mengajar', err);
    }
  }

  public static async getCurrentAssignment(
    teacherId: string
  ): Promise<ServiceResponse<TeacherAssignment | null>> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: TeacherAssignment | null }>(
        `/assignments/current?teacherId=${teacherId}`
      );

      if (response.success) {
        return this.createSuccess(response.data || null);
      }
      return this.createSuccess(null);
    } catch (err) {
      return this.createError('Gagal memuat jadwal aktif', err);
    }
  }
}
