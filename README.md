# ADON-API
RESTFUL API framework using HAPI. This API is designed to handle secured access through token based requests and social account verifications. The goal of this writing is to produce a way to use all these great tools together and start working on your codes without the need to setup all the stuffs one by one. It is best to understand each tools provided by HAPIJS however.

## Installation
install the framework and joi (which is highly recomended tool for parameter validation in hapi)
```npm
npm i adon-api --save
npm i joi --save
```

## Sample code
Create index.js in your project root and enter the following
```javascript 1.6
"use strict";
//specify 
const server = require('adon-api')(__dirname);

return server.start().then(function callback() {
	server.log('info', 'test', 'server has started!');
}).catch(function callback(err) {
	server.log('error', 'test', err.message, err);
});
```

## Configurations
As best practice, the service insist on setting your server config with the environment variables. The best method is using the dotEnv module. 
Create a file named '.env' in the root of the application. enter the following
```text
API_SERVER_HOST_URL=http://localhost:8100
NODE_ENV=development
```
You can add more configurations here as much as you like and they can be accessed in code as
```javascript 1.6
const service_url = process.env.API_SERVER_HOST_URL;
server.log('debug', 'test', 'server configured to run at: ' +  service_url);
```

## Logs
adon-api uses intel for logging. You can perform logs by calling server.log() function. The parameters are as follows :
* log_level - specifies one of intel's log level
	* trace
	* verbose
	* info
	* debug
	* warning
	* error
	* critical
* sender - this indicator specifies which object or instance triggered the log (ex: 'server', 'my_app')
* message - the message body to render to stdout
* data (optional) - any object or variable you want to tage with the log (ex: the Error object)
```javascript
server.log('info', 'my_app', 'wow! adon-api is simple!');
```

## Routes
Adding new rotes is simple and organized in this framework. First create a 'routes' folder in the root.
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
			return rep(data);
		}
	}
}
```

Run the application and use postman to invoke GET http://localhost:8100/say/hello  

Now lets create a route that contains parameters (POST/PUT/etc...)

```javascript 1.6
"use strict";
const Joi = require('joi');

module.exports = function Route(server){
	return {
		method: 'POST',
		path:'/say/hello/{name}',
		config: {
			auth: 'default',
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