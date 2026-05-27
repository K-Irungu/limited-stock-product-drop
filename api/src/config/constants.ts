import { env } from './env';

export const RESERVATION_TTL_SECONDS = env.RESERVATION_TTL_SECONDS;
export const RESERVATION_TTL_MS = RESERVATION_TTL_SECONDS * 1000;

export const STOCK_CACHE_KEY = (productId: string) => `stock:${productId}`;
export const RESERVATION_CACHE_KEY = (reservationId: string) => `reservation:${reservationId}`;
