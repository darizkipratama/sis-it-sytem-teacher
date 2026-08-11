import { BaseService, ServiceResponse } from './baseService';
import { SyllabusTopic, ClassId } from '../types';
import { LocalDataSource } from '../data/localDataSource';
import { EventService } from './eventService';

export class SyllabusService extends BaseService {
  /**
   * Get syllabus & lesson plans list
   */
  public static async getSyllabus(classId?: ClassId): Promise<ServiceResponse<SyllabusTopic[]>> {
    try {
      const list = await LocalDataSource.getSyllabus();
      const filtered = classId ? list.filter((s) => !s.classId || s.classId === classId) : list;
      return this.createSuccess(filtered);
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
      const list = await LocalDataSource.getSyllabus();
      const planId = `syl-${Date.now()}`;

      const created: SyllabusTopic = {
        ...newPlan,
        id: planId,
        createdAt: new Date().toISOString()
      };

      const updated = [created, ...list];
      await LocalDataSource.saveSyllabus(updated);

      await EventService.publishEvent('ihsancloud.syllabus.exchange', 'LESSON_PLAN_CREATED', {
        id: created.id,
        title: created.title,
        chapter: created.chapter,
        classId: created.classId || '10-IPA-1',
        subject: created.subject
      });

      return this.createSuccess(created, 'Rencana Ajar / Silabus Berhasil Ditambahkan');
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
      const list = await LocalDataSource.getSyllabus();
      const target = list.find((s) => s.id === syllabusId);
      if (!target) {
        return this.createError('Silabus tidak ditemukan');
      }

      target.subTopics = target.subTopics.map((st) =>
        st.id === subTopicId ? { ...st, completed: !st.completed } : st
      );

      await LocalDataSource.saveSyllabus(list);

      await EventService.publishEvent('ihsancloud.syllabus.exchange', 'SUBTOPIC_TOGGLED', {
        syllabusId,
        subTopicId,
        completed: target.subTopics.find((st) => st.id === subTopicId)?.completed
      });

      return this.createSuccess(target, 'Status sub-topik diperbarui');
    } catch (err) {
      return this.createError('Gagal memperbarui status sub-topik', err);
    }
  }
}
