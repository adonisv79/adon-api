"use strict";
const _ = require('lodash');
const EventEmitter = require('events');
const Promise = require('bluebird');
const REST_METHODS = [ 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH' ];
let _singleton, _server, self;

class RouteManager extends EventEmitter{
	constructor(server) {
		super();
		self = this;
		_server = server;
	}

	loadRoutes() {
		return new Promise((resolve, reject) => {
			const route_path = `${path.resolve(__dirname + '../../..')}/routes`

			_server.log('info','server', 'Loading routes from ' + route_path + '/routes...');
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
			_server.log('critical','route', 'ROUTE_METHOD_UNDEFINED');
		} else if (REST_METHODS.indexOf(route_config.method.toUpperCase()) < 0) {
			_server.log('critical','route', 'ROUTE_METHOD_INVALID');
		} else if (!route_config.path) {
			_server.log('critical','route', 'ROUTE_PATH_UNDEFINED');
		} else if (!route_config.handler) {
			_server.log('critical','route', 'ROUTE_HANDLER_UNDEFINED');
		}

		//wrap the handler in our route monitor
		const real_route = route_config.handler;
		route_config.handler = (req, rep) => {
			const endpoint = '[' + route_config.method + ':' + route_config.path + ']';
			try {
				_server.log('info','route', 'endpoint ' + endpoint + ' called');
				self.emit('called', {
					method: route_config.method,
					path: route_config.path
				});
				return Promise.resolve().then(() => {
					return real_route(req, function(data, status_code) {
						if (!status_code && data && data.statusCode) {
							status_code = data.statusCode; //override
						}
						rep(data).code(status_code || 200);
					});
				}).catch((err) => {
					_server.log('error','route', endpoint + err.message, err);
					self.emit('error', req, rep, err);
				});
			} catch(err) {
				_server.log('critical','route', endpoint + err.message, err);
				self.emit('error', req, rep, err);
			}
		};

		if (_.get(route_config, 'config.validate')) {
			route_config.config.validate.failAction = function onValidationFail(req, rep, src, err) {
				self.emit('error', req, rep, err);
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