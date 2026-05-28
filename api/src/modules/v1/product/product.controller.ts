import { Request, Response } from 'express';
import * as productService from './product.service';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/utils/response';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { products, meta } = await productService.listProducts(req);
  sendPaginated(res, products, meta);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProduct(req.params.id);
  sendSuccess(res, product);
});

export const getProductStock = asyncHandler(async (req: Request, res: Response) => {
  const stock = await productService.getProductStock(req.params.id);
  sendSuccess(res, { stock });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  sendCreated(res, product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, { message: 'Product deleted' });
});
