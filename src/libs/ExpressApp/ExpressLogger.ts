export interface KeyValuePair<T> {
  [index: string]: T;
}

export interface ExpressLoggerConfig {
  onCritical: (message: string, data?: KeyValuePair<any> | Error) => Promise<boolean>;
  onError: (message: string, data?: KeyValuePair<any> | Error) => Promise<boolean>;
  onWarn: (message: string, data?: KeyValuePair<any>) => Promise<boolean>;
  onInfo: (message: string, data?: KeyValuePair<any>) => Promise<boolean>;
  onDebug: (message: string, data?: KeyValuePair<any>) => Promise<boolean>;
}

export class ExpressLogger {
  private config: ExpressLoggerConfig;

  constructor(config: ExpressLoggerConfig) {
    this.config = config;
  }

  async critical(message: string, data?: KeyValuePair<any> | Error): Promise<boolean> {
    return this.config.onCritical(message, data);
  }

  async error(message: string, data?: KeyValuePair<any> | Error): Promise<boolean> {
    return this.config.onError(message, data);
  }

  async warn(message: string, data?: KeyValuePair<any>): Promise<boolean> {
    return this.config.onWarn(message, data);
  }

  async info(message: string, data?: KeyValuePair<any>): Promise<boolean> {
    return this.config.onInfo(message, data);
  }

  async debug(message: string, data?: KeyValuePair<any>): Promise<boolean> {
    return this.config.onDebug(message, data);
  }
}