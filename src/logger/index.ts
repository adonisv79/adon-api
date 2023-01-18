import winston, { format } from 'winston'
import config from '../config'

winston.addColors({
  crit: 'white magentaBG',
  error: 'black redBG',
  warn: 'black yellowBG',
  info: 'italic cyan',
  debug: 'bold blue',
  verbose: 'bold green',
})

/**
 * These are the log levels we will support only
 */
const levels = {
  crit: 0, // Critical errors that impact the stability of the system rendering it useless or break
  error: 1, // Errors that affect a process flow that may will need attention
  warn: 2, // Warnings that may affect requests or the entire service
  info: 3, // Regular log informations that are non-issue but may help understand the service state
  debug: 4, // debug level logs that should not be in production
  verbose: 5, // verbose information that may include even PII that should never be in production
}

const logger = winston.createLogger({
  level: config.API.LOGGING.LEVEL,
  levels,
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        format.printf((info) => `[${info.timestamp}][${info.level.toUpperCase()}]: ${JSON.stringify(info)}`),
        format.colorize({ all: true }),
      ),
    }),
  ],
})

export default logger
