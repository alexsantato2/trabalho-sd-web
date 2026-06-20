import api from './api';
import type { PageResponse, Product, ProductFilters } from '../types';

interface ProductRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  sort?: string;
  minDiscount?: string;
}

export const productService = {
  async getProducts(filters?: ProductFilters, page = 0, size = 12): Promise<PageResponse<Product>> {
    console.log("/products - params:", { ...filters, page, size });
    const res = await api.get('/products', { params: { ...filters, page, size } });
    return res.data;
  },

  async getProduct(id: string): Promise<Product> {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(data: ProductRequest): Promise<Product> {
    const res = await api.post('/products', data);
    return res.data;
  },

  async updateProduct(id: string, data: ProductRequest): Promise<Product> {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  async getAllProducts(): Promise<Product[]> {
    const res = await api.get('/products/all');
    return res.data;
  },

  async activateProduct(id: string): Promise<Product> {
    const res = await api.patch(`/products/${id}/activate`);
    return res.data;
  },

  async deactivateProduct(id: string): Promise<Product> {
    const res = await api.patch(`/products/${id}/deactivate`);
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async updateStock(id: string, delta: number): Promise<Product> {
    const res = await api.patch(`/products/${id}/stock`, { delta });
    return res.data;
  },
};
