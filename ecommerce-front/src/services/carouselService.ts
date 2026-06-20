import api from './api';
import type { Carousel, CarouselRequest } from '../types';

export const carouselService = {
  // GET /api/carousels - Listar carrosséis com produtos ordenados
  async getCarousels(): Promise<Carousel[]> {
    const res = await api.get('/carousels');
    return res.data;
  },

  // POST /api/carousels - Criar um novo carrossel
  async createCarousel(data: CarouselRequest): Promise<Carousel> {
    const res = await api.post('/carousels', data);
    return res.data;
  },

  // POST /api/carousels/{id}/products/{productId} - Adicionar produto ao carrossel
  async addProductToCarousel(carouselId: string, productId: string): Promise<void> {
    await api.post(`/carousels/${carouselId}/products/${productId}`);
  },

  // DELETE /carousels/{id} - Remover um carrossel
  async deleteCarousel(id: string): Promise<void> {
    await api.delete(`/carousels/${id}`);
  },

  async bulkSave(payload: Carousel[]): Promise<Carousel[]> {
    const res = await api.put('/carousels/bulk', payload);
    return res.data;
  },

  updateCarouselProducts: async (carouselId: string, productIds: string[]) => {
    // A rota recebe o array de IDs e o backend gerencia a posição conforme a ordem do array
    return await api.post(`/carousels/${carouselId}/products/bulk`, productIds);
  },
};