export type UserRole = 'CUSTOMER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AuthUser {
  userId: string;
  name: string;
  role: UserRole;
  token: string;
  refreshToken: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  active: boolean;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
}

export interface ProductFilters {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  items: OrderItemRequest[];
  shippingCep: string;
  shippingStreet: string;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingNumber: string;
  shippingComplement: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCep: string;
  shippingStreet: string;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingNumber: string;
  shippingComplement: string;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface OrderNotification {
  orderId: string;
  userId: string;
  userName: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
}

export interface StockNotification {
  productId: string;
  productName: string;
  newStock: number;
  timestamp: string;
}

export interface Carousel {
  id: string;
  name: string;
  position: number;
  products: Product[]; // Os produtos já vêm ordenados pelo backend baseado nos Gaps
}

export interface CarouselRequest {
  name: string;
}

// export interface MoveRequest {
//   id: string;                    // ID do item que está sendo movido (Carrossel ou Produto)
//   positionBefore: number | null; // Posição do item acima dele (null se virou o 1º da fila)
//   positionAfter: number | null;  // Posição do item abaixo dele (null se virou o último da fila)
// }

export interface MoveRequest {
  id: string;          // ID do elemento que está se movendo (pode ser o ID do produto ou do carrossel)
  targetPosition: number; // Nova posição de destino (0, 1, 2...)
}