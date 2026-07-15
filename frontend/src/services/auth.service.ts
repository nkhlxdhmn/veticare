/**
 * Auth API service. Handles login (form-encoded for OAuth2), register, profile, and logout.
 */
import api from '@/lib/axios';
import type { TokenPair, User, UserCreatePayload, UserUpdatePayload } from '@/types';

export const authService = {
  /**
   * Login with email + password. Backend expects OAuth2PasswordRequestForm
   * which is application/x-www-form-urlencoded with `username` and `password`.
   */
  login: async (email: string, password: string): Promise<TokenPair> => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const { data } = await api.post<TokenPair>('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  register: async (payload: UserCreatePayload): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/register', payload);
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  updateProfile: async (payload: UserUpdatePayload): Promise<User> => {
    const { data } = await api.put<User>('/auth/me', payload);
    return data;
  },

  refresh: async (refreshToken: string): Promise<TokenPair> => {
    const { data } = await api.post<TokenPair>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },
};
