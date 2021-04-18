import e from 'express'
import fs from 'fs'
import { logger } from '../logger'

const MODULE_NAME = 'EXPRESSAPP_ROUTEMANAGER'

export default class RouteManager {
  private _api: e.Express

  private _routePath: string

  constructor(api: e.Express, rootDir: string) {
    this._api = api
    this._routePath = `${rootDir}/routes`
  }

  async init(): Promise<void> {
    const files = fs.readdirSync(this._routePath)
    const routeNames = files.filter((f) => {
      const fname = f.split('.')
      if (fname.length !== 3 || fname[1]?.toLowerCase() !== 'rt' || !(fname[2]?.toLowerCase() === 'ts' || fname[2]?.toLowerCase() === 'js')) {
        return false
      }
      return true
    })
    logger.info(`[${MODULE_NAME}]: Found ${routeNames.length} route(s)`)
    if (routeNames.length > 0) {
      const loadRoutePromises = []
      for (let i = 0; i < routeNames.length; i += 1) {
        loadRoutePromises.push((async () => {
          const router = e.Router()
          const routeFilePath = `${this._routePath}/${routeNames[i]}`
          const loadRouter = await import(routeFilePath)
          logger.info(`[${MODULE_NAME}]: Loading route file ${routeFilePath}`)
          await loadRouter.default(this._api, router)
          const fname = routeNames[i]?.split('.')
          let routeName = '/'
          if (fname && fname[0]?.toLowerCase() !== 'index') {
            routeName = `/${fname[0]?.split('_').join('/')}`
          }
          this._api.use(routeName, router)
          logger.info(`[${MODULE_NAME}]: route created for ${routeName}`)
        })())
      }
      await Promise.all(loadRoutePromises)
    }
  }
}
