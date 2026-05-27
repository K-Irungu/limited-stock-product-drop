import { prisma } from '../config/database';
import * as reservationRepository from '../modules/reservation/reservation.repository';
import * as productRepository from '../modules/product/product.repository';
import { deleteCachedReservation } from '../cache/reservation.cache';
import { invalidateStockCache } from '../cache/stock.cache';

export const runExpirationJob = async (): Promise<void> => {
  const expired = await reservationRepository.findExpiredReservations();

  if (expired.length === 0) return;

  console.log(`[expiration.job] Processing ${expired.length} expired reservation(s)`);

  for (const reservation of expired) {
    try {
      await prisma.$transaction(async (tx) => {
        await reservationRepository.updateReservationStatus(reservation.id, 'EXPIRED', tx);
        await productRepository.incrementStock(reservation.productId, reservation.quantity, tx);
      });

      await deleteCachedReservation(reservation.id);
      await invalidateStockCache(reservation.productId);

      console.log(`[expiration.job] Expired reservation ${reservation.id}, restored ${reservation.quantity} unit(s) to product ${reservation.productId}`);
    } catch (err) {
      console.error(`[expiration.job] Failed to process reservation ${reservation.id}:`, err);
    }
  }
};