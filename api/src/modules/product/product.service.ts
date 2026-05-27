import * as productRepository from './product.repository';
import { getCachedStock, setCachedStock } from '../../cache/stock.cache';
import { CreateProductInput, UpdateProductInput, ProductQuery } from './product.types';
import { NotFoundError } from '../../shared/errors/errors';
import { parsePagination, buildPaginationMeta } from '../../shared/utils/pagination';
import { Request } from 'express';

export const listProducts = async (req: Request) => {
  const { page, limit, skip } = parsePagination(req);
  const search = req.query.search as string | undefined;

  const { products, total } = await productRepository.findProducts(search, skip, limit);

  return {
    products,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getProduct = async (id: string) => {
  const product = await productRepository.findProductById(id);
  if (!product) throw NotFoundError('Product');
  return product;
};

export const getProductStock = async (id: string): Promise<number> => {
  const cached = await getCachedStock(id);
  if (cached !== null) return cached;

  const product = await productRepository.findProductById(id);
  if (!product) throw NotFoundError('Product');

  await setCachedStock(id, product.stock);
  return product.stock;
};

export const createProduct = async (data: CreateProductInput) => {
  return productRepository.createProduct(data);
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  const existing = await productRepository.findProductById(id);
  if (!existing) throw NotFoundError('Product');

  return productRepository.updateProduct(id, data);
};

export const deleteProduct = async (id: string) => {
  const existing = await productRepository.findProductById(id);
  if (!existing) throw NotFoundError('Product');

  await productRepository.deleteProduct(id);
};
