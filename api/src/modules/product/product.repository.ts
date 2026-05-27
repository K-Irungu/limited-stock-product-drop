import { prisma } from '../../config/database';
import { CreateProductInput, UpdateProductInput } from './product.types';

export const findProducts = async (
  search?: string,
  skip = 0,
  take = 20
) => {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
};

export const findProductById = async (id: string) => {
  return prisma.product.findUnique({ where: { id } });
};

export const createProduct = async (data: CreateProductInput) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};

export const decrementStock = async (
  id: string,
  quantity: number,
  tx = prisma
) => {
  return tx.product.update({
    where: { id },
    data: { stock: { decrement: quantity } },
  });
};

export const incrementStock = async (
  id: string,
  quantity: number,
  tx = prisma
) => {
  return tx.product.update({
    where: { id },
    data: { stock: { increment: quantity } },
  });
};
