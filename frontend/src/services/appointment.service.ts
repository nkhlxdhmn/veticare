/**
 * Appointment API service. Full CRUD.
 */
import api from '@/lib/axios';
import type { Appointment, AppointmentCreatePayload, AppointmentUpdatePayload } from '@/types';

export const appointmentService = {
  getAll: async (params?: { skip?: number; limit?: number }): Promise<Appointment[]> => {
    const { data } = await api.get<Appointment[]>('/appointments', { params });
    return data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const { data } = await api.get<Appointment>(`/appointments/${id}`);
    return data;
  },

  create: async (payload: AppointmentCreatePayload): Promise<Appointment> => {
    const { data } = await api.post<Appointment>('/appointments', payload);
    return data;
  },

  update: async (id: string, payload: AppointmentUpdatePayload): Promise<Appointment> => {
    const { data } = await api.put<Appointment>(`/appointments/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};
