# adon-api

Express JS + Typescript + Jest development made easier. The goal is for us to easily build websites or APIs without managing the same dependencies and breaking out of our standards and conventions each time. We follow convention and configuration over code so that all future projects are handled easily.

## Project stats

* Package: [![npm](https://img.shields.io/npm/v/adon-api.svg)](https://www.npmjs.com/package/adon-api) [![npm](https://img.shields.io/npm/dm/adon-api.svg)](https://www.npmjs.com/package/adon-api)
* License: [![GitHub](https://img.shields.io/github/license/adonisv79/adon-api.svg)](https://github.com/adonisv79/adon-api/blob/master/LICENSE)
* CICD: [![Codacy Badge](https://app.codacy.com/project/badge/Grade/8308805088ac436b82f87e48a48633a1)](https://www.codacy.com/gh/adonisv79/adon-api/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=adonisv79/adon-api&amp;utm_campaign=Badge_Grade) [![CircleCI](https://dl.circleci.com/status-badge/img/gh/adonisv79/adon-api/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/adonisv79/adon-api/tree/master)

## Running the sample

On the root of this project is a simplified sample project. Run it with the following command...

```npm
npm run start:sample
```

Then from your browser, check the route endpoints for these

* http://localhost:3000
* http://localhost:3000/test

## How it works?

Technologies used:

* Express JS - our core framework is based on express and so this module will provide a library to easily kickstart an express js web service.
* TypeScript - Our projects will be based only on TypeScript so make sure this is installed on your system.
* Redis - used for handling rate limits and advisable for using in session management.
* Rate Limitter, helm, etc - security mechanism as recommended from express (https://expressjs.com/en/advanced/best-practice-security.html)
* Winston - default logger mechanism
* DOTENV for configuration

### logger

The built-in logger (winston) is set to utilize the common 6 logging levels in my dev experience. You can access the logger instance as part of the ExpressApp instance's 'log' property.

```node
// usage log.{level}( message, meta )
ExpressApp.log.info('Information here', { traceToken: 'SOME-GUID'})
ExpressApp.log.error('An error occured here', { traceToken: 'SOME-GUID', err })
```

const levels = {
  crit: 0, // Critical errors that impact the stability of the system rendering it useless or break
  error: 1, // Errors that affect a process flow that may will need attention
  warn: 2, // Warnings that may affect requests or the entire service
  info: 3, // Regular log informations that are non-issue but may help understand the service state
  debug: 4, // debug level logs that should not be in production
  verbose: 5, // verbose information that may include even PII that should never be in production
}

### RouteManager

The RouteManager structures how REST routes are defined on the project. It also adds generic logs and a 'trace-token' to the request header that we can use to better debug logs for a particular request (user must make sure to add this explicitely to the meta of the logs). To define your routes, create a {*.rt.ts} file in the project's "routes" folder. It should export as default a function named route that accepts 2 parameters (the ExpressApp instance and the express router object).

```node
import { ExpressApp, Router, Request, Response } from 'adon-api'

export default function route(app: ExpressApp, router: Router): void {
  router.get('/', async (req: Request, res: Response) => {
    res.send('This is the root main route')
    app.log.debug('Response sent!', { traceToken: req.headers['trace-token'] })
  })

  router.get('/test', async (req: Request, res: Response) => {
    res.send('This is the root test route')
    app.log.debug('Response sent!', { traceToken: req.headers['trace-token'] })
  })
}

```

## Installation

install the following
    * adon-api framework (this)

```npm
npm i adon-api --save
```

## Redis Dependency

As mentioned above, this API depends on Redis particularly for the RateLimitter. I would recommend the use of redis for session management and other caching concerns as well. You can run it wherever and however you want. If you have docker for example (which I use for my developments) then just run the following to spin a new redis instance

``` sh
docker run --name local-redis -p 6379:6379 -d redis
```

## How to use

Create index.ts in your project root and enter the following

``` typescript
import { ExpressApp, ExpressAppConfig, EnvConfig } from 'adon-api'

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
```

### Environment configurations

* PORT - sets the port number where the service will listed to. (Default: 3000)
* SERVER_CORS_ALLOWED_ORIGINS - sets the allowed request origins urls. multiple URLs are divided by semicolon. (Default: '*')

Either set in your machine environment the values or create a file named '.env' in the root of the application then enter the following

```text
PORT=3000
SERVER_CORS_ALLOWED_ORIGINS=http://localhost.com;http://bytecommander.com;http://bcomm-local.com
```

You can add more configurations here as much as you like and they can be accessed in code as

```javascript 1.6
import { EnvConfig } from 'adon-api'

const port = EnvConfig.get('PORT')
// you can also set configurations on the fly
EnvConfig.set('APP_VAR', 'Hello world')
```

## Routes

Adding new routes is simple and organized in this framework. First create a 'routes' folder in the root.
Add new file inside the routes folder with the 'rt.ts' extension. To create a root route '/' name the file 'index.rt.ts'
You can also create routes on specific paths based on the filename. To make a route on path '/users/properties' name the file 'users_properties.rt.ts'

For this sample, lets create a file named 'index.rt.ts' and 'users_test.rt.ts' then enter the following in both files

```typescript
import { Router, Request, Response } from 'express'
import { ExpressApp } from '../../src/libs/ExpressApp'

export default function route (app: ExpressApp, router: Router): void {
    router.get('/', async (req: Request, res: Response) => {
        res.send("WOW!")
    })
    router.get('/test', async (req: Request, res: Response) => {
        res.send("YO!")
    })
}
```

Run the application and use postman to invoke GET on 'http://localhost:3000/', 'http://localhost:3000/test' and '<http://localhost:3000/users/properties/>
