import winston from 'winston'

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

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
)

const transports = [
  new winston.transports.Console(),
]

const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports,
})

export default logger
