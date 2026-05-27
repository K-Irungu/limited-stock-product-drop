import { getCache, setCache, deleteCache } from './cache.utils';
import { STOCK_CACHE_KEY } from '../config/constants';

const STOCK_TTL_SECONDS = 60;

export const getCachedStock = async (productId: string): Promise<number | null> => {
  return getCache<number>(STOCK_CACHE_KEY(productId));
};

export const setCachedStock = async (
  productId: string,
  stock: number
): Promise<void> => {
  await setCache<number>(STOCK_CACHE_KEY(productId), stock, STOCK_TTL_SECONDS);
};

export const invalidateStockCache = async (productId: string): Promise<void> => {
  await deleteCache(STOCK_CACHE_KEY(productId));
};
