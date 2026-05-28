import { Request, Response } from 'express';
import * as reservationService from './reservation.service';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/utils/response';

export const listReservations = asyncHandler(async (req: Request, res: Response) => {
  const { reservations, meta } = await reservationService.listReservations(req);
  sendPaginated(res, reservations, meta);
});

export const getReservation = asyncHandler(async (req: Request, res: Response) => {
  const reservation = await reservationService.getReservation(req.params.id);
  sendSuccess(res, reservation);
});

export const createReservation = asyncHandler(async (req: Request, res: Response) => {
  const reservation = await reservationService.createReservation(req.body);
  sendCreated(res, reservation);
});

export const cancelReservation = asyncHandler(async (req: Request, res: Response) => {
  const result = await reservationService.cancelReservation(req.params.id);
  sendSuccess(res, result);
});
