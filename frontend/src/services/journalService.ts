import { BaseService, ServiceResponse } from './baseService';
import { ClassJournal, ClassId } from '../types';
import { EventService } from './eventService';

export class JournalService extends BaseService {
  /**
   * Fetch journals for a specific class or all classes from backend
   */
  public static async getJournals(classId?: ClassId): Promise<ServiceResponse<ClassJournal[]>> {
    try {
      const path = classId ? `/journals?classId=${encodeURIComponent(classId)}` : '/journals';
      const response = await this.apiClient.get<{ success: boolean; data: ClassJournal[] }>(path);

      if (response.success && response.data) {
        return this.createSuccess(response.data);
      }
      return this.createSuccess([]);
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
      const response = await this.apiClient.post<{ success: boolean; data: ClassJournal }>('/journals', journalData);

      if (response.success && response.data) {
        await EventService.publishEvent('ihsancloud.journal.exchange', 'BERITA_ACARA_LOGGED', {
          journalId: response.data.id,
          sessionId: response.data.sessionId,
          classId: response.data.classId,
          subject: response.data.subject,
          verificationStatus: response.data.verificationStatus,
          teacher: response.data.teacherName
        });

        return this.createSuccess(response.data, 'Berita Acara & Jurnal Mengajar Berhasil Disimpan');
      }
      return this.createError('Gagal menyimpan jurnal pengajaran');
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
      const response = await this.apiClient.put<{ success: boolean; data: ClassJournal }>(
        `/journals/${journalId}/verify`,
        { status }
      );

      if (response.success && response.data) {
        await EventService.publishEvent('ihsancloud.journal.exchange', 'BERITA_ACARA_VERIFIED', {
          journalId,
          status,
          timestamp: new Date().toISOString()
        });

        return this.createSuccess(response.data, `Status berita acara diubah ke ${status}`);
      }
      return this.createError('Gagal memperbarui status verifikasi');
    } catch (err) {
      return this.createError('Gagal memperbarui status verifikasi', err);
    }
  }
}
