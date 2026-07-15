import api from '../lib/axios';

export const AuthService = {
  login: async (credentials: Record<string, any>) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData: Record<string, any>) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  }
};

export const PetService = {
  getAll: async () => {
    const { data } = await api.get('/pets');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/pets/${id}`);
    return data;
  }
};
