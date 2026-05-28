export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: string;
  userId: string;
  reservationId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  userId: string;
  reservationId: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  userId?: string;
  status?: OrderStatus;
}
