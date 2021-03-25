# ADON-API
Express JS + Typescript + Jest development made easier. The goal is for us to easily build websites or APIs without managing the same dependencies and breaking out of our standards and conventions each time. We follow convention and configuration over code so that all future projects are handled easily.

## How it works?
* Express JS - our core framework is based on express and so this module will provide a library to easily kickstart an express js web service.
* TypeScript - Our projects will be based only on TypeScript so make sure this is installed on your system.
* Redis - used for handling rate limits and advisable for using in session management.
* Rate Limitter, helm, etc - security mechanism as recommended from express (https://expressjs.com/en/advanced/best-practice-security.html)

## Installation
install the following
    * adon-api framework (this) 
```npm
npm i adon-api --save
```

## Redis Dependency
As mentioned abov, this API depends on Redis particularly for the RateLimitter. I would recommend the use of redis for session management and other caching concerns as well. You can run it wherever and however you want. If you have docker for example (which I use for my developments) then just run the following to spin a new redis instance
```
docker run --name local-redis -p 6379:6379 -d redis
```

## Sample code
Create index.ts in your project root and enter the following
```typescript
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
As best practice, the service insist on setting your service level and security risk configurations within the environment. The EnvConfig module uses the dotEnv module to load all environment variables in a .env file which populates the config with all environment variables.

Create a file named '.env' in the root of the application. enter the following
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

Run the application and use postman to invoke GET on 'http://localhost:3000/', 'http://localhost:3000/test' and 'http://localhost:3000/users/properties/
