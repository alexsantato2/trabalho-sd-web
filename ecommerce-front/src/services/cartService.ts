import api from './api'; // 👈 Usa a mesma instância configurada dos produtos!
import type { CartItem } from '../types';

export interface CartResponse {
  id: string;
  items: CartItem[];
  totalAmount: number;
}

export const cartService = {
  // GET /api/cart -> Obter o carrinho do usuário autenticado
  async getMyCart(): Promise<CartResponse> {
    const res = await api.get('/cart');
    return res.data;
  },

  // POST /api/cart/items -> Adicionar ou atualizar quantidade
  async addItem(productId: string): Promise<CartResponse> {
    const res = await api.post('/cart/items', { 
      productId, 
      quantity: 1 
    });
    return res.data;
  },

  // PATCH /api/cart/items/{productId} -> Atualizar diretamente a quantidade
  async updateQuantity(productId: string, quantity: number): Promise<CartResponse> {
    const res = await api.patch(`/cart/items/${productId}`, null, {
      params: { quantity }
    });
    return res.data;
  },

  // DELETE /api/cart/items/{productId} -> Remover um produto do carrinho
  async removeItem(productId: string): Promise<CartResponse> {
    const res = await api.delete(`/cart/items/${productId}`);
    return res.data;
  },

  // DELETE /api/cart -> Esvaziar o carrinho por completo
  async clearCart(): Promise<void> {
    await api.delete('/cart');
  }
};