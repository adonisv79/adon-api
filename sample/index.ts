import { ExpressApp, ExpressAppConfig, EnvConfig } from '../src'

// eslint-disable-next-line prefer-const
let app: ExpressApp

async function onHealthCheck(): Promise<boolean> {
  // test dependencies like redis, mongodb, etc. and make sure they are alive.
  // This should be triggered every few seconds to make sure the API is wirking properly
  // for now simulate all are ok
  return true
}

async function onLoading(): Promise<void> {
  // perform middleWareHandling here and anything that requires initializations.
}

async function onReady(): Promise<void> {
  // once everything is loaded, we start the application and are able to do some 
  // other functionalities before or after it like logging or starting other services.
  app.start()
}

const cfg: ExpressAppConfig = {
  port: parseInt(EnvConfig.get('PORT')) || 3000,
  onHealthCheck,
  onReady,
  onLoading,
}
app = new ExpressApp(cfg)
