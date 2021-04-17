import { ExpressApp, config } from '../src'

// eslint-disable-next-line prefer-const
let app: ExpressApp

async function onHealthCheck(): Promise<boolean> {
  // test dependencies like redis, mongodb, etc. and make sure they are alive.
  // This should be triggered every few seconds to make sure the API is wirking properly
  // for now simulate all are ok
  console.log('Healthcheck called...')
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

async function onDestroy(): Promise<void> {
  // run codes to perform proper cleanups or allow time for some functions to take time to complete
  console.log('cleaning up stuffs...')
}

app = new ExpressApp({
  port: parseInt(config?.API?.PORT || '3000', 10),
  onHealthCheck,
  onReady,
  onLoading,
  onDestroy,
})
