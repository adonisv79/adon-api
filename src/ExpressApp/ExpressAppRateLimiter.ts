import { Request, Response, NextFunction } from 'express'
import { RateLimiterRedis, IRateLimiterStoreOptions } from 'rate-limiter-flexible'
import Redis from 'ioredis'
import config from '../config'
import { logger } from '../logger'

logger.info('Setting rate limiter...')
const rc = new Redis(config?.API?.REDIS?.CONNECTIONS.RATELIMITTER)
const points = parseInt(config?.API?.INGRESS?.RATELIMITER?.POINTS, 10)
const consumption = parseInt(config?.API?.INGRESS?.RATELIMITER?.CONSUMPTION, 10)
const duration = parseInt(config?.API?.INGRESS?.RATELIMITER?.DURATION, 10)
const blockDuration = parseInt(config?.API?.INGRESS?.RATELIMITER?.BLOCKDURATION, 10)

const options: IRateLimiterStoreOptions = {
  storeClient: rc,
  keyPrefix: 'middleware',
  points,
  duration,
  blockDuration,
  inmemoryBlockOnConsumed: points,
  inmemoryBlockDuration: blockDuration,
}
const rateLimiter: RateLimiterRedis = new RateLimiterRedis(options)
logger.debug('Rate limitter set to the following...')
logger.debug({
  points,
  consumption,
  duration,
  blockDuration: options.blockDuration,
})

export default async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.ip) {
      await rateLimiter.consume(req.ip, consumption)
    } else {
      res.status(400).send('REQUEST_INVALID')
    }
    next()
  } catch (err) {
    logger.warn('REQUEST_TOO_MANY', { ip: req.ip, err })
    res.status(429).send('REQUEST_TOO_MANY')
  }
}

export function destroyRateLimitterRedisConn(): void {
  if (rc.status === 'ready') rc.disconnect()
}
