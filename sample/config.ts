import dotenv from 'dotenv'

dotenv.config()
const REDIS_URL = process.env.REDIS_URL || process.env.REDISCLOUD_URL || 'redis://localhost:6379/0'

export default {
  dev: {
    disableSlackLogging: (process.env.DEV_DISABLE_SLACK_LOGGING === '1'),
    disableAutoJobTriggers: (process.env.DEV_DISABLE_AUTO_JOB_TRIGGERS === '1'),
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    deploymentType: process.env.NODE_ENV || 'development',
    logLevel: process.env.SERVER_LOG_LEVEL ? process.env.SERVER_LOG_LEVEL as string : 'info',
  },
  mongodb: {
    connectionString: {
      main: process.env.MONGODB_CONN ? process.env.MONGODB_CONN as string : 'mongodb://localhost:27017/test',
    },
  },
  redis: {
    connectionString: {
      main: REDIS_URL,
      rateLimitter: REDIS_URL,
    },
  },
  ingress: {
    rateLimit: {
      points: process.env.INGRESS_RATELIMIT_POINTS ? parseInt(process.env.INGRESS_RATELIMIT_POINTS as string, 10) : 5,
      duration: process.env.INGRESS_RATELIMIT_DURATION ? parseInt(process.env.INGRESS_RATELIMIT_DURATION as string, 10) : 1,
      consumption: process.env.INGRESS_RATELIMIT_CONSUMPTION ? parseInt(process.env.INGRESS_RATELIMIT_CONSUMPTION as string, 10) : 1,
      blockDuration: process.env.INGRESS_RATELIMIT_BLOCKDURATION ? parseInt(process.env.INGRESS_RATELIMIT_BLOCKDURATION as string, 10) : 5,
    },
  },
}

