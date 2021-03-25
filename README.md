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
import { Express } from 'express';
import { ExpressApp, ExpressAppConfig } from 'adon-api';

let app: ExpressApp;

async function onHealthCheck(): Promise<boolean> {
  // test dependencies like redis, mongodb, etc. and make sure they are alive.
  // This should be triggered every few seconds to make sure the API is wirking properly
  // for now simulate all are ok
  return true;
}

async function onLoading(e: Express): Promise<void> {
  // perform middleWareHandling here and anything that requires initializations.
}

async function onReady(): Promise<void> {
  // once everything is loaded, we start the application and are able to do some 
  // other functionalities before or after it like logging or starting other services.
  app.start();
}

// This is an ExpressApp configuration
const cfg: ExpressAppConfig = {
  port: config.server.port,
  onHealthCheck,
  onReady,
  onLoading,
};
app = new ExpressApp(cfg);
```

### Environment configurations
As best practice, the service insist on setting your service level and security risk configurations within the environment. The best method is using the dotEnv module. 
Create a file named '.env' in the root of the application. enter the following
```text
API_SERVER_HOST_URL=http://localhost:8100
NODE_ENV=development
MY_VAR=HELLO
```
You can add more configurations here as much as you like and they can be accessed in code as
```javascript 1.6
const message = process.env.MY_VAR;
server.log('debug', 'test', 'The environment says ' +  message);
```

## Logs
adon-api uses intel for logging. You can perform logs by calling server.log() function. The parameters are as follows :
* log_level - specifies one of intel's log level. To ensure consistency, use the following for the reason mentioned
    * critical (DEV/QA/PROD) - a server critical issue that was not handled by caught. Usually stuffs that fall into a general catch in a try-catch block.
    * error (DEV/QA/PROD) - Managed and non-trivial errors. These are errors like not found, server maintenance issue, network error that is not process breaking 
    * warning (DEV/QA/PROD) - Issues that can be used to indicate some problems. Ex: memory about to be fully utilized, suspicious access, etc
    * info (DEV/QA/PROD) - High level Information that helps in providing service state to the administrator
    * debug (DEV/QA) - Information that is not needed for production servers that typically helps developers and QA understand where the flow went
    * verbose (DEV/QA) - Information that is not needed for production servers that details the step by step (internal and detailed) flow of functions
    * trace (DEV/QA) - Information that is not needed for production servers that includes everything even user inputs and provided outputs. This is not advisable in PROD environment 
* sender - this indicator specifies which object or instance triggered the log (ex: 'server', 'my_app')
* message - the message body to render to stdout
* data (optional) - any object or variable you want to tage with the log (ex: the Error object)
```javascript
server.log('info', 'my_app', 'wow! adon-api is simple!');
```

## Routes
Adding new routes is simple and organized in this framework. First create a 'routes' folder in the root.
Add new folder inside the routes folder (to organize your routes) or any javascript file.

For this sample, lets create a file named 'get-say_hello.js' and enter the following
```javascript 1.6
"use strict";

module.exports = function Route(server){
    return {
        method: 'GET',
        path:'/say/hello',
        config: {
            description: 'An endpoint that makes you happy (you introvert!)',
            notes:'you need a friend...',
            cors: {
                origin: [ '*' ],
                additionalHeaders: [ 'cache-control', 'x-requested-with' ]
            },
            tags: [ 'api' ]
        },
        handler: function (req, rep) {
            server.log('info', 'my_server', 'GET /say/hello called!');
            return rep({
                message: 'hello client'
            });
        }
    }
}
```

Run the application and use postman to invoke GET http://localhost:8100/say/hello  

Now lets create a route that contains parameters (POST/PUT/etc...)
lets create a file named 'post-say_hello.js' and enter the following

```javascript 1.6
"use strict";
const Joi = require('joi');

module.exports = function Route(server){
    return {
        method: 'POST',
        path:'/say/hello/{name}',
        config: {
            description: 'makes the greeting more personal',
            notes:'hello mr. loner...',
            cors: {
                origin: [ '*' ],
                additionalHeaders: [ 'cache-control', 'x-requested-with' ]
            },
            tags: [ 'api' ],
            validate: {
                payload: {
                    message : Joi.string().min(5).max(30).required()
                        .description('any message you want to tell yourself?')
                }
            }
        },
        handler: function (req, rep) {
            server.log('info', 'POST /say/hello/{name} called!');
            return rep({
                message: 'hello ' + req.params.name + ', ' + req.payload.message 
            });
        }
    }
}
```

Again, run the application and use postman to invoke POST http://localhost:8100/say/hello/meathead with the following body:
```javascript 1.6
{
    message: 'lets eat!'
}
```

## Bootstrap
Some files might be necessary to be loaded during the server startup. These processes will be organized and accessed via the bootstrap mechanism in place. First create a folder named 'bootstrap' in the root directory.

## Events

### Errors
Certain objects within the server provide error events emitters. to capture route related events, add the following line of code where the server was initialized
```javascript 1.6

server.routes.on('error', function (req, rep, err) {
    //..do some stuffs to validate or modify the error
    return rep({
        error: err
    });
});
```