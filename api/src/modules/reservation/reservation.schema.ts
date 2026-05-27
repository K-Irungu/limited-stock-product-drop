import { z } from 'zod';

export const createReservationSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(10),
});

export const reservationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED']).optional(),
});
