import { BaseService, ServiceResponse } from './baseService';
import { Announcement, ClassId } from '../types';
import { LocalDataSource } from '../data/localDataSource';
import { EventService } from './eventService';

export class AnnouncementService extends BaseService {
  public static async getAnnouncements(classId?: ClassId): Promise<ServiceResponse<Announcement[]>> {
    try {
      const list = await LocalDataSource.getAnnouncements();
      const filtered = classId ? list.filter((a) => a.classId === classId) : list;
      return this.createSuccess(filtered);
    } catch (err) {
      return this.createError('Gagal memuat pengumuman', err);
    }
  }

  public static async addAnnouncement(
    newAnn: Omit<Announcement, 'id' | 'createdAt'>
  ): Promise<ServiceResponse<Announcement>> {
    try {
      const list = await LocalDataSource.getAnnouncements();
      const created: Announcement = {
        ...newAnn,
        id: `ann-${Date.now()}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      const updated = [created, ...list];
      await LocalDataSource.saveAnnouncements(updated);

      await EventService.publishEvent('ihsancloud.announcement.exchange', 'ANNOUNCEMENT_BROADCAST', {
        id: created.id,
        classId: created.classId,
        title: created.title,
        whatsappGateway: created.sendToWhatsapp ? 'TRIGGERED' : 'OFF'
      });

      return this.createSuccess(created, 'Pengumuman Berhasil Disiarkan');
    } catch (err) {
      return this.createError('Gagal mempublikasikan pengumuman', err);
    }
  }
}
