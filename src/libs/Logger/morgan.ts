import morgan, { StreamOptions } from 'morgan'
import logger from './winston'

const stream: StreamOptions = {
  write: (message) => { logger.http(message) },
}

const morganMiddleware = morgan(
  'dev',
  { stream },
)

export default morganMiddleware
