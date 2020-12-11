import winston from 'winston';
import { LoggerTemplate, KeyValuePair } from 'logger-template';
import config from './../config';

const d = new Date();
const logFilePrefix = d.getUTCFullYear() + (`0${d.getUTCMonth() + 1}`).slice(-2) + (`0${d.getUTCDate()}`).slice(-2);

function createLogger(): winston.Logger {
  return winston.createLogger({
    level: config.server.logLevel,
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: `logs/${logFilePrefix}-error.log`, level: 'error' }),
      new winston.transports.File({ filename: `logs/${logFilePrefix}-combined.log` }),
      new winston.transports.Console({ format: winston.format.simple() }),
    ],
  });
}

const wlogger: winston.Logger = createLogger();

async function onCritical(message: string, data?: KeyValuePair<any> | Error): Promise<void> {
  await wlogger.error(message, data);
}

async function onError(message: string, data?: KeyValuePair<any> | Error): Promise<void> {
  await wlogger.info(message, data);
}

async function onWarn(message: string, data?: KeyValuePair<any>): Promise<void> {
  await wlogger.warn(message, data);
}

async function onInfo(message: string, data?: KeyValuePair<any>): Promise<void> {
  await wlogger.info(message, data);
}

async function onDebug(message: string, data?: KeyValuePair<any>): Promise<void> {
  await wlogger.debug(message, data);
}

class Logger extends LoggerTemplate {
  constructor() {
    super({
      onCritical,
      onError,
      onWarn,
      onInfo,
      onDebug,
    });
  }
}

const singleton = new Logger();
export default singleton;
