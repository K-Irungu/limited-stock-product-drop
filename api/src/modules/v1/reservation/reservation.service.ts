import * as reservationRepository from './reservation.repository';
import * as productRepository from '../product/product.repository';
import { setCachedReservation, deleteCachedReservation } from '../../../cache/reservation.cache';
import { invalidateStockCache } from '../../../cache/stock.cache';
import { CreateReservationInput } from './reservation.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../../shared/errors/errors';
import { parsePagination, buildPaginationMeta } from '../../../shared/utils/pagination';
import { RESERVATION_TTL_SECONDS } from '../../../config/constants';
import { prisma } from '../../../config/database';
import { Request } from 'express';

export const listReservations = async (req: Request) => {
  const { page, limit, skip } = parsePagination(req);
  const userId = req.query.userId as string | undefined;
  const status = req.query.status as string | undefined;

  const { reservations, total } = await reservationRepository.findReservations(
    skip,
    limit,
    userId,
    status as any
  );

  return {
    reservations,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getReservation = async (id: string) => {
  const reservation = await reservationRepository.findReservationById(id);
  if (!reservation) throw NotFoundError('Reservation');
  return reservation;
};

export const createReservation = async (data: CreateReservationInput) => {
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000);

  const reservation = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: data.productId } });

    if (!product) throw NotFoundError('Product');
    if (product.stock < data.quantity) {
      throw ConflictError(`Insufficient stock. Available: ${product.stock}`);
    }

    const existing = await tx.reservation.findFirst({
      where: { userId: data.userId, productId: data.productId, status: 'PENDING' },
    });

    if (existing) {
      throw ConflictError('You already have a pending reservation for this product');
    }

    await productRepository.decrementStock(data.productId, data.quantity, tx);

    const created = await reservationRepository.createReservation(data, expiresAt, tx);

    return created;
  });

  await setCachedReservation({
    id: reservation.id,
    userId: reservation.userId,
    productId: reservation.productId,
    quantity: reservation.quantity,
    expiresAt: reservation.expiresAt.toISOString(),
  });

  await invalidateStockCache(data.productId);

  return reservation;
};

export const cancelReservation = async (id: string) => {
  const reservation = await reservationRepository.findReservationById(id);
  if (!reservation) throw NotFoundError('Reservation');

  if (reservation.status !== 'PENDING') {
    throw BadRequestError(`Cannot cancel a reservation with status: ${reservation.status}`);
  }

  await prisma.$transaction(async (tx) => {
    await reservationRepository.updateReservationStatus(id, 'CANCELLED', tx);
    await productRepository.incrementStock(reservation.productId, reservation.quantity, tx);
  });

  await deleteCachedReservation(id);
  await invalidateStockCache(reservation.productId);

  return { message: 'Reservation cancelled' };
};
