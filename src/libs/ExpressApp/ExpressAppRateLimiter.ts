import { Request, Response, NextFunction } from 'express'
import { RateLimiterRedis, IRateLimiterStoreOptions } from 'rate-limiter-flexible'
import Redis from 'ioredis'
import config from './../ConfigHelper'
import logger from '../Logger'

logger.info('Setting rate limiter...')
const rc = new Redis(config.get('redis_connectionString_rateLimitter'))

const options: IRateLimiterStoreOptions = {
  storeClient: rc,
  keyPrefix: 'middleware',
  points: parseInt(config.get('INGRESS_RATELIMIT_POINTS')) || 5,
  duration: parseInt(config.get('INGRESS_RATELIMIT_DURATION')) || 1,
  blockDuration: parseInt(config.get('INGRESS_RATELIMIT_BLOCKDURATION')) || 1,
  inmemoryBlockOnConsumed: parseInt(config.get('INGRESS_RATELIMIT_POINTS')) || 5,
  inmemoryBlockDuration: parseInt(config.get('INGRESS_RATELIMIT_BLOCKDURATION')) || 1,
}
const rateLimiter: RateLimiterRedis = new RateLimiterRedis(options)

export default async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.ip) {
      await rateLimiter.consume(req.ip, parseInt(config.get('INGRESS_RATELIMIT_CONSUMPTION')) || 1)
    } else {
      res.status(400).send('REQUEST_INVALID')
    }
    next()
  } catch (err) {
    logger.warn('REQUEST_TOO_MANY', { ip: req.ip })
    res.status(429).send('REQUEST_TOO_MANY')
  }
}
