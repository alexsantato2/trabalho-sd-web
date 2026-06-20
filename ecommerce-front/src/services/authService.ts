import api from './api';
import type { AuthUser } from '../types';

interface RegisterRequest { name: string; email: string; password: string; }
interface LoginRequest { email: string; password: string; }

export const authService = {
  async register(data: RegisterRequest): Promise<AuthUser> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthUser> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async refresh(refreshToken: string): Promise<AuthUser> {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },
};
