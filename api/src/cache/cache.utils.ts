import { redis } from '../config/redis';
import { logger } from '../shared/utils/logger';

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    logger.warn({ err, key }, 'Cache get failed');
    return null;
  }
};

export const setCache = async <T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (err) {
    logger.warn({ err, key }, 'Cache set failed');
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn({ err, key }, 'Cache delete failed');
  }
};
