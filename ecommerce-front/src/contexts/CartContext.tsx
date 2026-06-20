import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { cartService } from '../services/cartService';
import { productImageUrl } from '../utils/imageUrl';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  count: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Função tradutora: Transforma o formato do Java no formato que sua tela espera
  function refreshCartState(backendData: any) {
    if (!backendData || !backendData.items) {
      setItems([]);
      setTotal(0);
      setCount(0);
      return;
    }

    const mappedItems = backendData.items.map((backendItem: any) => ({
      product: {
        id: backendItem.productId,
        name: backendItem.productName,
        price: backendItem.unitPrice,
        imageUrl: productImageUrl(backendItem.imageUrl) || ''
      },
      quantity: backendItem.quantity
    }));

    setItems(mappedItems);
    setTotal(backendData.totalAmount || 0);
    setCount(mappedItems.reduce((sum: number, i: any) => sum + i.quantity, 0));
  }

  // 2. Inicialização segura: se der 403 (falta de token), ele não quebra o app
  useEffect(() => {
    setLoading(true);
    cartService.getMyCart()
      .then((data) => {
        refreshCartState(data);
      })
      .catch((err) => {
        // Se der erro (como o 403 de usuário deslogado), limpa o estado pacificamente
        console.warn("Carrinho não carregado (usuário pode estar deslogado):", err.message);
        setItems([]);
        setTotal(0);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  async function addItem(product: Product) {
    try {
      const updatedCart = await cartService.addItem(product.id);
      refreshCartState(updatedCart);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  }

  async function removeItem(productId: string) {
    try {
      const updatedCart = await cartService.removeItem(productId);
      refreshCartState(updatedCart);
    } catch (error) {
      console.error(error);
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    try {
      const updatedCart = await cartService.updateQuantity(productId, quantity);
      refreshCartState(updatedCart);
    } catch (error) {
      console.error(error);
    }
  }

  async function clearCart() {
    try {
      await cartService.clearCart();
      setItems([]);
      setTotal(0);
      setCount(0);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}