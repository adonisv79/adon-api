"use strict";
const _ = require('lodash');
const Boom = require('boom');
const EventEmitter = require('events');
const logger = require('./adon-logger')('info');
const Promise = require('bluebird');
const REST_METHODS = [ 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH' ];
let _singleton, _server, self

function handleRouteError(req, rep, err) {
	let code;

	if (!err.isBoom) {
		if (!err.isBoom && err.name && !(err.name === 'Error' || err.name === 'TypeError')) {
			if (err.message) {
				err.name = ''; //hide the name because BOOM appends it to the message
			}
		}
		err = Boom.badRequest(err);
	}

	if (err.isBoom) {
		code = err.statusCode || err.output.statusCode;
	} else { //other error types
		if (err.name === 'MongoError') {
			code = 500;
			err = Boom.badImplementation(err);
		}
	}

	if (code >= 400 && code < 500) { //handle client errors
		logger.error('route', err.message, err);
	} else { //handle server (and possibly any other codes) errors
		logger.critical('route', err.message, err);
	}

	return rep(Boom.wrap(err));
}

class RouteManager extends EventEmitter{
	constructor(server) {
		super();
		self = this;
		_server = server;
	}

	loadRoutes() {
		return new Promise((resolve, reject) => {
			const route_path = _server.path.root + '/routes';
			logger.info('server', 'Loading routes from ' + route_path + '/routes...');
			let routes = require('require-all')({
				dirname     :  route_path,
				filter      :  /(.)\.js$/,
				recursive   : true,
				resolve: (Route) => {
					if (typeof Route !== 'function') {
						throw new Error('ROUTE_NOT_A_FUNCTION');
					}
					return this.add(Route(_server));
				}
			});
			resolve();
		});
	}

	add (route_config) {
		_server.log('info', 'route-mgr' , 'adding route ' + route_config.method + ' ' + route_config.path + '...');
		self.emit('add', route_config);
		//validate critical items
		if (!route_config.method) {
			logger.critical('route', 'ROUTE_METHOD_UNDEFINED');
		} else if (REST_METHODS.indexOf(route_config.method.toUpperCase()) < 0) {
			logger.critical('route', 'ROUTE_METHOD_INVALID');
		} else if (!route_config.path) {
			logger.critical('route', 'ROUTE_PATH_UNDEFINED');
		} else if (!route_config.handler) {
			logger.critical('route', 'ROUTE_HANDLER_UNDEFINED');
		}

		//wrap the handler in our route monitor
		const real_route = route_config.handler;
		route_config.handler = (req, rep) => {
			route_config;
			self.emit('called', {
				method: route_config.method,
				path: route_config.path
			});
			try {
				logger.info('route', 'endpoint called');
				return Promise.resolve().then(() => {
					return real_route(req, function(data, status_code) {
						if (!status_code && data.statusCode) {
							status_code = data.statusCode; //override
						}
						rep(data).code(status_code || 200);
					});
				}).catch((err) => {
					handleRouteError(req, rep, err);
				});
			} catch(err) {
				handleRouteError(req, rep, err);
			}
		}


		if (_.get(route_config, 'config.validate')) {
			route_config.config.validate.failAction = function onValidationFail(req, rep, src, err) {
				handleRouteError(req, rep, err);
			}
		}

		//Add the route
		_server.hapi.route(route_config);
		_server.log('info', 'route-mgr' , route_config.method + ' ' + route_config.path + ' added!');
	}
}


module.exports = (server) => {
	return _singleton ? _singleton : _singleton = new RouteManager(server)
};