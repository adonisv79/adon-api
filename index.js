'use strict';

const _ = require('lodash');
const EventEmitter = require('events');
const Hapi = require('hapi');
const logger = require('./adon-logger')('info');
const Promise = require('bluebird');
const url = require('url');
let _singleton, _routes;

//initiate server instance
const hapi_server = new Hapi.Server();

class RestHapiServer extends EventEmitter {
	
	constructor(root_path){
		super();
		_.set(hapi_server, 'path.root', root_path);
		logger.info('server', 'Initializing from ' + root_path + '...');
		// Create a hapi_server with a host and port
		let host_url;

		//Set the connections
		if (!process.env.API_SERVER_HOST_URL) {
			logger.info('env', 'Configuration API_SERVER_HOST_URL not found...');
			logger.info('env', 'Using default "http://localhost:8000"');
			host_url = url.parse('http://localhost:8000');
		} else {
			logger.info('env', 'config API_SERVER_HOST_URL found!');
			host_url = url.parse(process.env.API_SERVER_HOST_URL);
		}

		hapi_server.connection({
			address: host_url.hostName, 
			host: host_url.hostName, 
			port: host_url.port 
		});

		logger.info('server', 'Loading routes from ' + root_path + '/routes...');
		_routes = require('./route-manager')(hapi_server);
	}
	
	start() {
		logger.info('server', 'Start invoked...');
		_routes.loadRoutes();
		return new Promise((resolve, reject) => {
			logger.info('server', 'Runing starting event...');
			this.emit('starting', hapi_server);
			//Start the hapi_server
			hapi_server.start((err) => {
				if (err) {
					return reject(err);
				}
				logger.info('server', 'Successfully started at:', hapi_server.info.uri);
				logger.info('server', 'Runing start event...');
				this.emit('started', hapi_server);
				resolve(hapi_server);
			});
		});
	}

	log(level, sender, message, data) {
		logger[level](sender, message, data);
	}

	get routes() { return _routes; }
	
}

module.exports = (main_path) => {
	return _singleton ? _singleton : _singleton = new RestHapiServer(main_path)
};