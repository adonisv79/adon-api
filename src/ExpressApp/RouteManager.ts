import { randomUUID } from 'crypto'
import e from 'express'
import fs from 'fs'
import ExpressAppInterface from './ExpressAppInterface'

const MODULE_NAME = 'EXPRESSAPP_ROUTEMANAGER'

/**
 * The RouteManager simplifies and enforces how routes are defined
 */
export default class RouteManager {
  /** internal reference to our express instance */
  private _app: ExpressAppInterface

  /** fixed route path structure for our projects */
  private _routePath: string

  /**
   * Initializes the RouteManager
   * @param app Pointer to the ExpressApp instance
   * @param rootDir The main directory where we will locate the routes folder
   */
  constructor(app: ExpressAppInterface, rootDir: string) {
    this._app = app
    this._routePath = `${rootDir}/routes`
  }

  /**
   * Initializes the Routes
   */
  async init(): Promise<void> {
    const files = fs.readdirSync(this._routePath)
    const routeNames = files.filter((f) => {
      const fname = f.split('.')
      if (fname.length !== 3 || fname[1]?.toLowerCase() !== 'rt' || !(fname[2]?.toLowerCase() === 'ts' || fname[2]?.toLowerCase() === 'js')) {
        return false
      }
      return true
    })
    this._app.log.info(`[${MODULE_NAME}]: Found ${routeNames.length} route(s)`)
    if (routeNames.length > 0) {
      const loadRoutePromises = []
      for (let i = 0; i < routeNames.length; i += 1) {
        loadRoutePromises.push((async () => {
          const router = e.Router()
          router.use((req, _res, next) => {
            req.headers['trace-token'] = randomUUID()
            this._app.log.debug(`Request established at '${req.path}'`, { traceToken: req.headers['trace-token'] })
            next()
          })
          const routeFilePath = `${this._routePath}/${routeNames[i]}`
          const loadRouter = await import(routeFilePath)
          this._app.log.info(`[${MODULE_NAME}]: Loading route file ${routeFilePath}`)
          await loadRouter.default(this._app, router)
          const fname = routeNames[i]?.split('.')
          let routeName = '/'
          if (fname && fname[0]?.toLowerCase() !== 'index') {
            routeName = `/${fname[0]?.split('_').join('/')}`
          }
          this._app.express.use(routeName, router)
          this._app.log.info(`[${MODULE_NAME}]: route created for ${routeName}`)
        })())
      }
      await Promise.all(loadRoutePromises)
    }
  }
}
