/**
 * Vaccination API service. CRUD + upcoming vaccinations.
 */
import api from '@/lib/axios';
import type { Vaccination, VaccinationCreatePayload, VaccinationUpdatePayload } from '@/types';

export const vaccinationService = {
  getForPet: async (
    petId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<Vaccination[]> => {
    const { data } = await api.get<Vaccination[]>(`/vaccinations/pet/${petId}`, { params });
    return data;
  },

  getUpcoming: async (): Promise<Vaccination[]> => {
    const { data } = await api.get<Vaccination[]>('/vaccinations/upcoming');
    return data;
  },

  create: async (petId: string, payload: VaccinationCreatePayload): Promise<Vaccination> => {
    const { data } = await api.post<Vaccination>('/vaccinations', payload, {
      params: { pet_id: petId },
    });
    return data;
  },

  update: async (id: string, payload: VaccinationUpdatePayload): Promise<Vaccination> => {
    const { data } = await api.put<Vaccination>(`/vaccinations/${id}`, payload);
    return data;
  },
};
