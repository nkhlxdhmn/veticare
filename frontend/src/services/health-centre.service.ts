/**
 * Health Centre API service.
 */
import api from '@/lib/axios';
import type { HealthCentre, HealthCentreCreatePayload } from '@/types';

export const healthCentreService = {
  getAll: async (params?: { skip?: number; limit?: number }): Promise<HealthCentre[]> => {
    const { data } = await api.get<HealthCentre[]>('/clinics', { params });
    return data;
  },

  getById: async (id: string): Promise<HealthCentre> => {
    const { data } = await api.get<HealthCentre>(`/clinics/${id}`);
    return data;
  },

  create: async (payload: HealthCentreCreatePayload): Promise<HealthCentre> => {
    const { data } = await api.post<HealthCentre>('/clinics', payload);
    return data;
  },

  update: async (id: string, payload: Partial<HealthCentreCreatePayload>): Promise<HealthCentre> => {
    const { data } = await api.put<HealthCentre>(`/clinics/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clinics/${id}`);
  },
};
