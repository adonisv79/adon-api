# ADON-API
RESTFUL API framework using HAPI. This API is designed to handle secured access through token based requests and social account verifications. The goal of this writing is to produce a way to use all these great tools together and start working on your codes without the need to setup all the stuffs one by one. It is best to understand each tools provided by HAPIJS however.

## Installation
install the following
    * adon-api framework (this) 
    * joi (which is highly recomended tool for parameter validation in hapijs)
    * config - which stores code level configuration (those that do not change often which we do not want to be editable by the environment)
```npm
npm i adon-api --save
npm i joi --save
npm i config --save
```

## Sample code
Create index.js in your project root and enter the following
```javascript 1.6
"use strict";

const AdonAPI = require('adon-api');
const server = new AdonAPI();
server.plugins.loadHapiPlugins();

return server.start().then(function onServerStarted() {
    return server.routes.loadRoutes();
}).then(function onRouteLoadComplete() {
    server.log('info', 'test', 'server has started!');
}).catch(function onError(err) {
    server.log('error', 'test', err.message, err);
});
```

## Configurations
This framework uses 2 types of configuration. A static code level configuration struct and an environment modifyable configuration (dotenv)

### Code level configurations
The config folder is where you store static (does not change much) configurations that you implement per project. This basically utilizes the nodejs 'config' project. To start, create a folder named 'config' on the root directory and add a default.js file inside. The file will contain the following:
```javascript 1.6
module.exports = {
    server: {
    env_path: './.env'
    },
    my: {
        test: {
            string: "hello",
            array: [ 'a', 'b', 'c' ],
            bool: true
        }
    }
};
```
You can add more configurations here as much as you like and they can be accessed in code as
```javascript 1.6
const config = require('config');
server.log('debug', 'test', 'my test string is ' +  config.my.test.string);
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