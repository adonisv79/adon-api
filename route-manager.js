"use strict";
const _ = require('lodash');
const Boom = require('boom');
const EventEmitter = require('events');
const logger = require('./adon-logger')('info');
const REST_METHODS = [ 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH' ];
let _singleton, _hapi_server, self

function handleRouteError(req, rep, err) {
	logger.critical('route', err.message, err);
}

class RouteManager extends EventEmitter{
	constructor(hapi_server) {
		super();
		self = this;
		_hapi_server = hapi_server;
	}

	loadRoutes() {
		const route_path = _hapi_server.path.root + '/routes';
		logger.info('server', 'Loading routes from ' + route_path + '/routes...');
		let routes = require('require-all')({
			dirname     :  route_path,
			filter      :  /(.)\.js$/,
			recursive   : true,
			resolve: (Route) => {
				if (typeof Route !== 'function') {
					throw new Error('ROUTE_NOT_A_FUNCTION');
				}
				return this.add(Route(_hapi_server));
			}
		});
	}

	add (route_config) {
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
				real_route(req, function(data, status_code) {
					if (!status_code && data.statusCode) {
						status_code = data.statusCode; //override
					}
					rep(data).code(status_code || 200);
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
		_hapi_server.route(route_config);
	}
}


module.exports = (hapi_server) => {
	return _singleton ? _singleton : _singleton = new RouteManager(hapi_server)
};