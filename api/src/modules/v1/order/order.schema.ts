import { z } from 'zod';

export const createOrderSchema = z.object({
  userId: z.string().uuid(),
  reservationId: z.string().uuid(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']).optional(),
});
