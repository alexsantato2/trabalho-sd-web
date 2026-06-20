import api from './api';
import type { User } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateProfile(name: string): Promise<User> {
    const res = await api.patch('/users/me', { name });
    return res.data;
  },

  async getAllUsers(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data;
  },

  async getUser(id: string): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
};
