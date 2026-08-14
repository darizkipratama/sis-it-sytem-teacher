import { BaseService, ServiceResponse } from './baseService';
import { ClassJournal, ClassId } from '../types';
import { LocalDataSource } from '../data/localDataSource';
import { EventService } from './eventService';

export class JournalService extends BaseService {
  /**
   * Fetch journals for a specific class or all classes
   */
  public static async getJournals(classId?: ClassId): Promise<ServiceResponse<ClassJournal[]>> {
    try {
      const journals = await LocalDataSource.getJournals();
      const filtered = classId ? journals.filter((j) => j.classId === classId) : journals;
      return this.createSuccess(filtered);
    } catch (err) {
      return this.createError('Gagal memuat jurnal kelas', err);
    }
  }

  /**
   * Save or update a class journal / Berita Acara Pengajaran
   */
  public static async saveJournal(
    journalData: Partial<ClassJournal> & { classId: ClassId; subjectId: string; sessionId: string }
  ): Promise<ServiceResponse<ClassJournal>> {
    try {
      const journals = await LocalDataSource.getJournals();
      const existingIndex = journals.findIndex(
        (j) => j.id === journalData.id || j.sessionId === journalData.sessionId
      );

      const journalId = journalData.id || `jour-${Date.now()}`;
      const now = new Date().toISOString();

      const journalEntry: ClassJournal = {
        id: journalId,
        sessionId: journalData.sessionId,
        classId: journalData.classId,
        subjectId: journalData.subjectId,
        subject: journalData.subject || 'Matematika Lanjut',
        teacherId: journalData.teacherId || 'usr-teach-1',
        teacherName: journalData.teacherName || 'Pak Ihsan Cloud, S.Pd',
        date: journalData.date || now.split('T')[0],
        period: journalData.period || 'Jam 01 - 02',
        materialTaught: journalData.materialTaught || '',
        achievements: journalData.achievements || '',
        obstaclesAndSolutions: journalData.obstaclesAndSolutions || '',
        studentBehaviorNotes: journalData.studentBehaviorNotes || '',
        incidentReport: journalData.incidentReport || '',
        presentCount: journalData.presentCount || 0,
        absentCount: journalData.absentCount || 0,
        verificationStatus: journalData.verificationStatus || 'Disahkan Headmaster',
        createdAt: journalData.createdAt || now
      };

      let updatedList: ClassJournal[];
      if (existingIndex >= 0) {
        updatedList = [...journals];
        updatedList[existingIndex] = journalEntry;
      } else {
        updatedList = [journalEntry, ...journals];
      }

      await LocalDataSource.saveJournals(updatedList);

      // Event sync
      await EventService.publishEvent('ihsancloud.journal.exchange', 'BERITA_ACARA_LOGGED', {
        journalId: journalEntry.id,
        sessionId: journalEntry.sessionId,
        classId: journalEntry.classId,
        subject: journalEntry.subject,
        verificationStatus: journalEntry.verificationStatus,
        teacher: journalEntry.teacherName
      });

      return this.createSuccess(journalEntry, 'Berita Acara & Jurnal Mengajar Berhasil Disimpan');
    } catch (err) {
      return this.createError('Gagal menyimpan jurnal pengajaran', err);
    }
  }

  /**
   * Verify / Sign Berita Acara
   */
  public static async updateVerificationStatus(
    journalId: string,
    status: 'Draft' | 'Disahkan Headmaster' | 'Selesai'
  ): Promise<ServiceResponse<ClassJournal>> {
    try {
      const journals = await LocalDataSource.getJournals();
      const target = journals.find((j) => j.id === journalId);
      if (!target) {
        return this.createError('Jurnal tidak ditemukan');
      }

      target.verificationStatus = status;
      await LocalDataSource.saveJournals(journals);

      await EventService.publishEvent('ihsancloud.journal.exchange', 'BERITA_ACARA_VERIFIED', {
        journalId,
        status,
        timestamp: new Date().toISOString()
      });

      return this.createSuccess(target, `Status berita acara diubah ke ${status}`);
    } catch (err) {
      return this.createError('Gagal memperbarui status verifikasi', err);
    }
  }
}
