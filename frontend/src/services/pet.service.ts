/**
 * Pet API service. Full CRUD + image upload.
 */
import api from '@/lib/axios';
import type { Pet, PetCreatePayload, PetUpdatePayload } from '@/types';

export const petService = {
  getAll: async (params?: {
    species?: string;
    breed?: string;
    skip?: number;
    limit?: number;
  }): Promise<Pet[]> => {
    const { data } = await api.get<Pet[]>('/pets', { params });
    return data;
  },

  getById: async (id: string): Promise<Pet> => {
    const { data } = await api.get<Pet>(`/pets/${id}`);
    return data;
  },

  create: async (payload: PetCreatePayload): Promise<Pet> => {
    const { data } = await api.post<Pet>('/pets', payload);
    return data;
  },

  update: async (id: string, payload: PetUpdatePayload): Promise<Pet> => {
    const { data } = await api.put<Pet>(`/pets/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pets/${id}`);
  },

  uploadImage: async (petId: string, file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('pet_id', petId);
    formData.append('file', file);
    const { data } = await api.post<{ message: string; image_url: string }>(
      '/uploads/pet-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },
};
