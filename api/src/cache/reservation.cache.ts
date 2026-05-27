import { getCache, setCache, deleteCache } from './cache.utils';
import { RESERVATION_CACHE_KEY, RESERVATION_TTL_SECONDS } from '../config/constants';

export interface CachedReservation {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  expiresAt: string;
}

export const getCachedReservation = async (
  reservationId: string
): Promise<CachedReservation | null> => {
  return getCache<CachedReservation>(RESERVATION_CACHE_KEY(reservationId));
};

export const setCachedReservation = async (
  reservation: CachedReservation
): Promise<void> => {
  await setCache<CachedReservation>(
    RESERVATION_CACHE_KEY(reservation.id),
    reservation,
    RESERVATION_TTL_SECONDS
  );
};

export const deleteCachedReservation = async (
  reservationId: string
): Promise<void> => {
  await deleteCache(RESERVATION_CACHE_KEY(reservationId));
};
