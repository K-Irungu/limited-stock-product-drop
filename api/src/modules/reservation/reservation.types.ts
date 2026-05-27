export type ReservationStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface Reservation {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationInput {
  userId: string;
  productId: string;
  quantity: number;
}

export interface ReservationQuery {
  page?: number;
  limit?: number;
  userId?: string;
  status?: ReservationStatus;
}
