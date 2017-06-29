'use strict';

const _ = require('lodash');
const EventEmitter = require('events');
const Hapi = require('hapi');
const logger = require('./adon-logger')('info');
const Promise = require('bluebird');
const url = require('url');
let _singleton, _routes, _plugins;

require('dotenv').config(); //load .env file
//initiate server instance
const _hapi = new Hapi.Server();

class RestHapiServer extends EventEmitter {
	
	constructor(root_path){
		super();
		this.hapi = _hapi;
		_.set(this, 'path.root', root_path);
		logger.info('server', 'Initializing from ' + root_path + '...');
		// Create a _hapi with a host and port
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

		_hapi.connection({
			address: host_url.hostName, 
			host: host_url.hostName, 
			port: host_url.port 
		});

		_plugins =  require('./plugin-manager')(this);
		_routes = require('./route-manager')(this);
	}
	
	start() {
		logger.info('server', 'Start invoked...');
		return new Promise((resolve, reject) => {
			this.emit('starting', this);

			//Start the _hapi
			_hapi.start((err) => {
				if (err) {
					return reject(err);
				}
				logger.info('server', 'Successfully started at:', _hapi.info.uri);
				logger.info('server', 'Runing start event...');
				this.emit('started', _hapi);
				resolve(_hapi);
			});
		});
	}

	log(level, sender, message, data) {
		logger[level](sender, message, data);
	}

	get routes() { return _routes; }
	get plugins() { return _plugins; }
	
}

module.exports = (main_path) => {
	return _singleton ? _singleton : _singleton = new RestHapiServer(main_path)
};