import { prisma } from '../../../config/database';
import { OrderStatus } from './order.types';

export const findOrders = async (
  skip = 0,
  take = 20,
  userId?: string,
  status?: OrderStatus
) => {
  const where = {
    ...(userId && { userId }),
    ...(status && { status }),
  };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { product: true, reservation: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total };
};

export const findOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: { product: true, reservation: true },
  });
};

export const findOrderByReservationId = async (reservationId: string) => {
  return prisma.order.findUnique({
    where: { reservationId },
  });
};

export const createOrder = async (
  userId: string,
  reservationId: string,
  productId: string,
  quantity: number,
  totalPrice: number,
  tx = prisma
) => {
  return tx.order.create({
    data: {
      userId,
      reservationId,
      productId,
      quantity,
      totalPrice,
      status: 'PENDING',
    },
    include: { product: true, reservation: true },
  });
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  tx = prisma
) => {
  return tx.order.update({
    where: { id },
    data: { status },
  });
};
