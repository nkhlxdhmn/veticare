/**
 * Notification API service. List, mark-read, unread count.
 */
import api from '@/lib/axios';
import type { Notification } from '@/types';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  markRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },
};
