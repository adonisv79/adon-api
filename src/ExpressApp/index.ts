import path from 'path'
import e, {
  Express, Request, Response, NextFunction,
} from 'express'
import cors from 'cors'
// import HttpError from 'http-error-types'
// These security implementations allow us to prevent data leak and attacks from hackers.
// Guides include best practices from https://expressjs.com/en/advanced/best-practice-security.html
import helmet from 'helmet'
import { Logger } from 'winston'
import { logger, morganMiddleware } from '../logger'
import rlimitMiddleware from './ExpressAppRateLimiter'
import { getAppRoot } from '../utils'
import config from '../config'
// eslint-disable-next-line import/no-cycle
import RouteManager from './RouteManager'

const PUBLIC_PATH = '../../public'

export type AsyncCallback<T> = (e: Express) => Promise<T>

export interface ExpressAppConfig {
  port: number;
  onHealthCheck: AsyncCallback<boolean>;
  onLoading: AsyncCallback<void>;
  onReady: AsyncCallback<void>;
  view?: {
    engine: string;
    path: string;
  };
}

export class ExpressApp {
  private _app: Express

  private _routes: RouteManager

  private _isReady: boolean

  private _logger: Logger

  private _appConfig: ExpressAppConfig

  private _rootDir: string

  get isReady(): boolean {
    return this._isReady
  }

  get log(): Logger {
    return this._logger
  }

  get rootDir(): string {
    return this._rootDir
  }

  get express():Express {
    return this._app
  }

  constructor(appConfig: ExpressAppConfig) {
    this._rootDir = getAppRoot()
    this._logger = logger
    this._appConfig = appConfig
    this._isReady = false
    this._app = e()
    this._routes = new RouteManager(this)
    this.init()
  }

  private async init(): Promise<void> {
    try {
      this.log.info('Loading API configurations...')
      this.log.debug(config)
      this.log.info('Utilizing morgan...')
      this._app.use(morganMiddleware)
      this.addCorsMiddleware()
      const publicPath = path.join(__dirname, PUBLIC_PATH)
      this.log.info(`Setting public path in ${publicPath}`)
      this._app.use(e.static(publicPath))
      // Load security routes first
      this.log.info('Loading securty middlewares...')
      this._app.use(helmet())
      this._app.use(rlimitMiddleware)
      this.addHealthCheckMiddleware()
      this.log.info(`Loading Routes in '${this.rootDir}/routes'...`)
      await this._routes.init()

      // Load other custom stuffs from consuming app
      this.log.info('Loading...')
      await this._appConfig.onLoading(this._app)
      this.addErrorHandlerMiddleware()

      this._isReady = true
      this.log.info('Server is ready...')
      await this._appConfig.onReady(this._app)
    } catch (err) {
      this.log.error('Initialization failed', err)
      process.exit(1)
    }
  }

  private addCorsMiddleware(): void {
    this.log.info('Setting up cors...')
    const corsWhitelist: string[] = (config?.API?.SECURITY?.CORS_ORIGINS || '*').split(';')
    this.log.debug(corsWhitelist)
    this._app.use(cors({
      origin: (origin, callback) => {
        if (corsWhitelist[0] === '*') { return callback(null, true) }
        if (origin && corsWhitelist.indexOf(origin) !== -1) { return callback(null, true) }
        if (!origin) { return callback(null, origin) }
        return callback(new Error('Not allowed by CORS'))
      },
    }))
  }

  private addErrorHandlerMiddleware(): void {
    this._app.use((_req: Request, _res: Response, next): void => {
      // if (!err.isHttpError) { // generic error
      //   this.log.error(`${MODULE_NAME}_UNHANDLED_ERROR`, { name: err.name, message: err.message, stack: err.stack })
      //   res.status(500).send({ error: 'Apologies but an error occured from our end. Please report this so we can serve you better.' })
      //   return
      // }
      // this.log.error(err.message, {
      //   name: err.name, message: err.message, stack: err.stack, statusCode: err.statusCode,
      // })
      // res.status(err.statusCode).send(err.message)
      next()
    })
  }

  private addHealthCheckMiddleware(): void {
    this.log.info(`Adding Healthcheck endpoint path '${config?.API?.STATS?.HEALTH?.ENDPOINT}'...`)
    this._app.use(config?.API?.STATS?.HEALTH?.ENDPOINT, async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this._appConfig.onHealthCheck(this._app)
        if (result === true) {
          res.status(200).send('OK')
        } else {
          res.status(500).send('NOT OK')
        }
      } catch (err) {
        next(err)
      }
    })
  }

  start(): void {
    if (!this.isReady) {
      throw new Error('SERVER_NOT_READY')
    }
    this._app.listen(this._appConfig.port, () => {
      this.log.info(`listening on port ${this._appConfig.port}!`)
    })
  }
}
