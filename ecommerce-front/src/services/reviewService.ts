import api from './api';
import type { Review, ReviewRequest } from '../types';

export const reviewService = {
  async getReviews(productId: string): Promise<Review[]> {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
  },

  async createReview(productId: string, data: ReviewRequest): Promise<Review> {
    const res = await api.post(`/products/${productId}/reviews`, data);
    return res.data;
  },

  async checkIfReviewed(productId: string): Promise<boolean> { 
    const res = await api.get(`/products/${productId}/reviews/check`); 
    return res.data;
  }, 
};