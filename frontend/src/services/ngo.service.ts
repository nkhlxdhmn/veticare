/**
 * NGO API service.
 */
import api from '@/lib/axios';
import type { NGO, NGOCreatePayload } from '@/types';

export const ngoService = {
  getAll: async (params?: { skip?: number; limit?: number }): Promise<NGO[]> => {
    const { data } = await api.get<NGO[]>('/ngos', { params });
    return data;
  },

  getById: async (id: string): Promise<NGO> => {
    const { data } = await api.get<NGO>(`/ngos/${id}`);
    return data;
  },

  create: async (payload: NGOCreatePayload): Promise<NGO> => {
    const { data } = await api.post<NGO>('/ngos', payload);
    return data;
  },

  update: async (id: string, payload: Partial<NGOCreatePayload>): Promise<NGO> => {
    const { data } = await api.put<NGO>(`/ngos/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/ngos/${id}`);
  },
};
