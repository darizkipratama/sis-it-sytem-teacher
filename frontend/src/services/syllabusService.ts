import { BaseService, ServiceResponse } from './baseService';
import { SyllabusTopic, ClassId } from '../types';
import { EventService } from './eventService';

export class SyllabusService extends BaseService {
  /**
   * Get syllabus & lesson plans list from backend
   */
  public static async getSyllabus(classId?: ClassId): Promise<ServiceResponse<SyllabusTopic[]>> {
    try {
      const path = classId ? `/syllabus?classId=${encodeURIComponent(classId)}` : '/syllabus';
      const response = await this.apiClient.get<{ success: boolean; data: SyllabusTopic[] }>(path);

      if (response.success && response.data) {
        return this.createSuccess(response.data);
      }
      return this.createSuccess([]);
    } catch (err) {
      return this.createError('Gagal mengambil daftar rencana ajar', err);
    }
  }

  /**
   * Add a new lesson plan / Rencana Ajar to syllabus
   */
  public static async addLessonPlan(
    newPlan: Omit<SyllabusTopic, 'id'>
  ): Promise<ServiceResponse<SyllabusTopic>> {
    try {
      const response = await this.apiClient.post<{ success: boolean; data: SyllabusTopic }>('/syllabus', newPlan);

      if (response.success && response.data) {
        await EventService.publishEvent('ihsancloud.syllabus.exchange', 'LESSON_PLAN_CREATED', {
          id: response.data.id,
          title: response.data.title,
          chapter: response.data.chapter,
          classId: response.data.classId || newPlan.classId,
          subject: response.data.subject
        });

        return this.createSuccess(response.data, 'Rencana Ajar / Silabus Berhasil Ditambahkan');
      }
      return this.createError('Gagal menambahkan rencana ajar');
    } catch (err) {
      return this.createError('Gagal menambahkan rencana ajar', err);
    }
  }

  /**
   * Toggle completion of subtopics
   */
  public static async toggleSubtopic(
    syllabusId: string,
    subTopicId: string
  ): Promise<ServiceResponse<SyllabusTopic>> {
    try {
      const response = await this.apiClient.patch<{ success: boolean; data: SyllabusTopic }>(
        `/syllabus/${syllabusId}/subtopics/${subTopicId}`
      );

      if (response.success && response.data) {
        await EventService.publishEvent('ihsancloud.syllabus.exchange', 'SUBTOPIC_TOGGLED', {
          syllabusId,
          subTopicId,
          completed: response.data.subTopics.find((st) => st.id === subTopicId)?.completed
        });

        return this.createSuccess(response.data, 'Status sub-topik diperbarui');
      }
      return this.createError('Gagal memperbarui status sub-topik');
    } catch (err) {
      return this.createError('Gagal memperbarui status sub-topik', err);
    }
  }
}
