import http, { Server } from 'http'
import path from 'path'
import e, { Express } from 'express'
import cors from 'cors'
// These security implementations allow us to prevent data leak and attacks from hackers.
// Guides include best practices from https://expressjs.com/en/advanced/best-practice-security.html
import helmet from 'helmet'
import { createTerminus, HealthCheckMap } from '@godaddy/terminus'
import { Logger } from 'winston'
import { logger, morganMiddleware } from '../logger'
import rlimitMiddleware, { destroyRateLimitterRedisConn } from './ExpressAppRateLimiter'
import { getAppRoot } from '../utils'
import config from '../config'
import RouteManager from './RouteManager'

const PUBLIC_PATH = '../../public'

export type AsyncCallback<T> = (e: Express) => Promise<T>

export interface ExpressAppConfig {
  port: number;
  onHealthCheck: AsyncCallback<boolean>;
  onLoading: AsyncCallback<void>;
  onReady: AsyncCallback<void>;
  onDestroy: AsyncCallback<void>;
  view?: {
    engine: string;
    path: string;
  };
}

export class ExpressApp {
  private _app: Express

  private _server: Server

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

  get express(): Express {
    return this._app
  }

  get server(): Server {
    return this._server
  }

  constructor(appConfig: ExpressAppConfig) {
    this._rootDir = getAppRoot()
    this._logger = logger
    this._appConfig = appConfig
    this._isReady = false
    this._app = e()
    this._server = http.createServer(this._app)
    this._routes = new RouteManager(this._app, this._rootDir)
    this.init()
  }

  private async init(): Promise<void> {
    try {
      this.log.info('Loading API configurations...')
      this.log.debug(config)
      this.log.info('Utilizing morgan...')
      this._app.use(morganMiddleware)
      const publicPath = path.join(__dirname, PUBLIC_PATH)
      this.log.info(`Setting public path in ${publicPath}`)
      this._app.use(e.static(publicPath))
      this.initSecurityMiddlewares()
      this.initTerminus()
      this.log.info(`Loading Routes in '${this.rootDir}/routes'...`)
      await this._routes.init()

      // Load other custom stuffs from consuming app
      this.log.info('Loading...')
      await this._appConfig.onLoading(this._app)

      this._isReady = true
      this.log.info('Server is ready...')
      await this._appConfig.onReady(this._app)
    } catch (err) {
      this.log.error('Initialization failed', err)
      process.exit(1)
    }
  }

  private initSecurityMiddlewares(): void {
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
    this.log.info('Applying helmet...')
    this._app.use(helmet())
    this.log.info('Applying rate-limitter...')
    this._app.use(rlimitMiddleware)
  }

  private initTerminus(): void {
    this.log.info('Applying healthcheck and graceful shutdown using terminus...')
    const healthChecks: HealthCheckMap = {}
    healthChecks[(config?.API?.STATS?.HEALTH?.ENDPOINT || '/health')] = async () => {
      await this._appConfig.onHealthCheck(this._app)
    }
    createTerminus(this._server, {
      signal: 'SIGINT',
      logger: (message: string, err: Error) => {
        if (err) {
          logger.error(message, err)
        } else {
          logger.warn(message)
        }
      },
      healthChecks,
      onSignal: async () => {
        await this.destroy()
      },
      onShutdown: async () => { logger.info('Shutting down service...') },
    })
  }

  start(): void {
    if (!this.isReady) {
      throw new Error('SERVER_NOT_READY')
    }
    this._server.listen(this._appConfig.port, () => {
      this.log.info(`listening on port ${this._appConfig.port}!`)
    })
  }

  async destroy(): Promise<void> {
    this._isReady = false
    await this._appConfig.onDestroy(this._app)
    destroyRateLimitterRedisConn()
    this._server.close()
  }
}
