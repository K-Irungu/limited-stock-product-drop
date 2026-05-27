import { Router } from 'express';
import * as reservationController from './reservation.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { createReservationSchema } from './reservation.schema';
import { reservationRateLimiter } from '../../shared/middleware/rateLimiter.middleware';

const router = Router();

router.get('/', reservationController.listReservations);
router.get('/:id', reservationController.getReservation);
router.post(
  '/',
  reservationRateLimiter,
  validate(createReservationSchema),
  reservationController.createReservation
);
router.patch('/:id/cancel', reservationController.cancelReservation);

export default router;
