import * as orderRepository from './order.repository';
import * as reservationRepository from '../reservation/reservation.repository';
import { deleteCachedReservation } from '../../cache/reservation.cache';
import { invalidateStockCache } from '../../cache/stock.cache';
import { CreateOrderInput } from './order.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/errors';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import { prisma } from '../../config/database';
import { Request } from 'express';

export const listOrders = async (req: Request) => {
  const { page, limit, skip } = parsePagination(req);
  const userId = req.query.userId as string | undefined;
  const status = req.query.status as string | undefined;

  const { orders, total } = await orderRepository.findOrders(
    skip,
    limit,
    userId,
    status as any
  );

  return {
    orders,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getOrder = async (id: string) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) throw NotFoundError('Order');
  return order;
};

export const createOrder = async (data: CreateOrderInput) => {
  const reservation = await reservationRepository.findReservationById(
    data.reservationId
  );

  if (!reservation) throw NotFoundError('Reservation');

  if (reservation.userId !== data.userId) {
    throw BadRequestError('Reservation does not belong to this user');
  }

  if (reservation.status !== 'PENDING') {
    throw BadRequestError(
      `Cannot create order from a reservation with status: ${reservation.status}`
    );
  }

  if (reservation.expiresAt < new Date()) {
    throw ConflictError('Reservation has expired');
  }

  const existingOrder = await orderRepository.findOrderByReservationId(
    data.reservationId
  );

  if (existingOrder) {
    throw ConflictError('An order already exists for this reservation');
  }

  const totalPrice = reservation.product.price * reservation.quantity;

  const order = await prisma.$transaction(async (tx) => {
    const created = await orderRepository.createOrder(
      data.userId,
      data.reservationId,
      reservation.productId,
      reservation.quantity,
      totalPrice,
      tx
    );

    await reservationRepository.updateReservationStatus(
      data.reservationId,
      'COMPLETED',
      tx
    );

    return created;
  });

  await deleteCachedReservation(data.reservationId);
  await invalidateStockCache(reservation.productId);

  return order;
};

export const cancelOrder = async (id: string) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) throw NotFoundError('Order');

  if (order.status !== 'PENDING') {
    throw BadRequestError(
      `Cannot cancel an order with status: ${order.status}`
    );
  }

  await prisma.$transaction(async (tx) => {
    await orderRepository.updateOrderStatus(id, 'CANCELLED', tx);
  });

  return { message: 'Order cancelled' };
};
