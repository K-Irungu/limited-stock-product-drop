import { Request, Response } from 'express';
import * as orderService from './order.service';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/utils/response';

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { orders, meta } = await orderService.listOrders(req);
  sendPaginated(res, orders, meta);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrder(req.params.id);
  sendSuccess(res, order);
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  sendCreated(res, order);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.cancelOrder(req.params.id);
  sendSuccess(res, result);
});
