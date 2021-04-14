import morgan, { StreamOptions } from 'morgan'
import logger from './winston'

/**
 * We write the stream into winston. the problem is that it also adds the color so we use the
 * regex below to rid of this in the message
 */
const stream: StreamOptions = {
  // eslint-disable-next-line no-control-regex
  write: (message) => { logger.http(message.replace(/\u001b\[[0-9]{1,2}m/g, '')) },
}

const morganMiddleware = morgan(
  'dev',
  { stream },
)

export default morganMiddleware
