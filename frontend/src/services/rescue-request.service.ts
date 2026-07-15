/**
 * Rescue Request API service.
 */
import api from '@/lib/axios';
import type { RescueRequest, RescueRequestCreatePayload, RescueStatus } from '@/types';

export const rescueRequestService = {
  getAll: async (): Promise<RescueRequest[]> => {
    const { data } = await api.get<RescueRequest[]>('/rescues');
    return data;
  },

  getPending: async (params?: { skip?: number; limit?: number }): Promise<RescueRequest[]> => {
    const { data } = await api.get<RescueRequest[]>('/rescues/pending', { params });
    return data;
  },

  create: async (payload: RescueRequestCreatePayload): Promise<RescueRequest> => {
    const { data } = await api.post<RescueRequest>('/rescues', payload);
    return data;
  },

  updateStatus: async (id: string, status: RescueStatus): Promise<RescueRequest> => {
    const { data } = await api.patch<RescueRequest>(`/rescues/${id}/status`, null, {
      params: { status_update: status },
    });
    return data;
  },
};
