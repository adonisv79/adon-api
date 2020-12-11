import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, IRateLimiterStoreOptions } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import config from '../../config';
import logger from '../Logger';

logger.info('Setting rate limiter...', config.ingress.rateLimit);
const rc = new Redis(config.redis.connectionString.rateLimitter);

const options: IRateLimiterStoreOptions = {
  storeClient: rc,
  keyPrefix: 'middleware',
  points: config.ingress.rateLimit.points,
  duration: config.ingress.rateLimit.duration,
  blockDuration: config.ingress.rateLimit.blockDuration,
  inmemoryBlockOnConsumed: config.ingress.rateLimit.points,
  inmemoryBlockDuration: config.ingress.rateLimit.blockDuration,
};
const rateLimiter: RateLimiterRedis = new RateLimiterRedis(options);

export default async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.ip) {
      await rateLimiter.consume(req.ip, config.ingress.rateLimit.consumption);
    } else {
      res.status(400).send('REQUEST_INVALID');
    }
    next();
  } catch (err) {
    logger.warn('REQUEST_TOO_MANY', { ip: req.ip });
    res.status(429).send('REQUEST_TOO_MANY');
  }
}
