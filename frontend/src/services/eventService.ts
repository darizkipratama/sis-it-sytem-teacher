import { BaseService, ServiceResponse } from './baseService';
import { AsyncMessageEvent } from '../types';
import { LocalDataSource } from '../data/localDataSource';

export class EventService extends BaseService {
  /**
   * Fetch recent asynchronous events
   */
  public static async getAsyncEvents(): Promise<ServiceResponse<AsyncMessageEvent[]>> {
    try {
      const events = await LocalDataSource.getAsyncEvents();
      return this.createSuccess(events);
    } catch (err) {
      return this.createError('Gagal mengambil antrean event', err);
    }
  }

  /**
   * Dispatch & log event to RabbitMQ Exchange / Supabase Realtime simulation
   */
  public static async publishEvent(
    topic: string,
    eventType: string,
    payload: any
  ): Promise<ServiceResponse<AsyncMessageEvent>> {
    try {
      const events = await LocalDataSource.getAsyncEvents();
      const newEvent: AsyncMessageEvent = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        topic,
        eventType,
        payload,
        status: 'SUPABASE_REALTIME_SYNCED',
        attempts: 1
      };

      const updated = [newEvent, ...events].slice(0, 50);
      await LocalDataSource.saveAsyncEvents(updated);

      return this.createSuccess(newEvent, 'Event berhasil disiarkan ke RabbitMQ/Supabase');
    } catch (err) {
      return this.createError('Gagal mempublikasikan event', err);
    }
  }
}
