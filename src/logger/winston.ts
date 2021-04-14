import winston, { format } from 'winston'
import config from '../config'

winston.addColors({
  error: 'white redBG',
  warn: 'italic black yellowBG',
  info: 'italic gray',
  http: 'magenta',
  debug: 'bold green',
})

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
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
