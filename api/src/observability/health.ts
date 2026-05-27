import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../shared/utils/logger';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'ok',
      redis: 'ok',
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    logger.error({ err }, 'Health check: database unreachable');
    health.status = 'degraded';
    health.services.database = 'unreachable';
  }

  try {
    await redis.ping();
  } catch (err) {
    logger.error({ err }, 'Health check: redis unreachable');
    health.status = 'degraded';
    health.services.redis = 'unreachable';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};
