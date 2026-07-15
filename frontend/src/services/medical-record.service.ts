/**
 * Medical Record API service. Full CRUD.
 */
import api from '@/lib/axios';
import type {
  MedicalRecord,
  MedicalRecordCreatePayload,
  MedicalRecordUpdatePayload,
} from '@/types';

export const medicalRecordService = {
  getForPet: async (
    petId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<MedicalRecord[]> => {
    const { data } = await api.get<MedicalRecord[]>(`/medical-records/pet/${petId}`, { params });
    return data;
  },

  getById: async (id: string): Promise<MedicalRecord> => {
    const { data } = await api.get<MedicalRecord>(`/medical-records/visit/${id}`);
    return data;
  },

  create: async (payload: MedicalRecordCreatePayload): Promise<MedicalRecord> => {
    const { data } = await api.post<MedicalRecord>('/medical-records', payload);
    return data;
  },

  update: async (id: string, payload: MedicalRecordUpdatePayload): Promise<MedicalRecord> => {
    const { data } = await api.put<MedicalRecord>(`/medical-records/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/medical-records/${id}`);
  },
};
