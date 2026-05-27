import { prisma } from '../../config/database';
import { CreateReservationInput, ReservationStatus } from './reservation.types';

export const findReservations = async (
  skip = 0,
  take = 20,
  userId?: string,
  status?: ReservationStatus
) => {
  const where = {
    ...(userId && { userId }),
    ...(status && { status }),
  };

  const [reservations, total] = await prisma.$transaction([
    prisma.reservation.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    }),
    prisma.reservation.count({ where }),
  ]);

  return { reservations, total };
};

export const findReservationById = async (id: string) => {
  return prisma.reservation.findUnique({
    where: { id },
    include: { product: true },
  });
};

export const findExpiredReservations = async () => {
  return prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
  });
};

export const createReservation = async (
  data: CreateReservationInput,
  expiresAt: Date,
  tx = prisma
) => {
  return tx.reservation.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity,
      status: 'PENDING',
      expiresAt,
    },
    include: { product: true },
  });
};

export const updateReservationStatus = async (
  id: string,
  status: ReservationStatus,
  tx = prisma
) => {
  return tx.reservation.update({
    where: { id },
    data: { status },
  });
};
