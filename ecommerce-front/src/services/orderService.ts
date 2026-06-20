import api from './api';
import type { Order, OrderRequest, OrderStatus } from '../types';

interface OrderFilters {
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: OrderStatus;
}

export const orderService = {
  async placeOrder(data: OrderRequest): Promise<Order> {
    const res = await api.post('/orders', data);
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get('/orders/my');
    return res.data;
  },

  async getAllOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const res = await api.get('/orders', { params: filters });
    return res.data;
  },

  async approveOrder(id: string): Promise<Order> {
    const res = await api.patch(`/orders/${id}/approve`);
    return res.data;
  },

  async rejectOrder(id: string): Promise<Order> {
    const res = await api.patch(`/orders/${id}/reject`);
    return res.data;
  },

  async getPendingCount(): Promise<{ count: number }> {
    const res = await api.get('/orders/pending-count');
    return res.data;
  },
};
