"use strict";
const _ = require('lodash');
const EventEmitter = require('events');
const fs = require('fs');
const logger = require('./adon-logger')();

let _singleton, _server, self;

class PluginManager extends EventEmitter{
	constructor(server) {
		super();
		self = this;
		_server = server;
	}

	loadHapiPlugins() {
		const hapi_plugin_path = _server.path.root + '/bootstrap/hapi';

		if (!fs.existsSync(hapi_plugin_path)) {
			return logger.info('server',
				'Bootstrapping hapi plugins skipped, ' + hapi_plugin_path + ' does not exist...');
		} else {
			logger.info('server', 'Bootstrapping hapi plugins ' + hapi_plugin_path + '...');
			return require('require-all')({
				dirname     :  hapi_plugin_path,
				filter      :  /(.)\.js$/,
				recursive   : true,
				resolve: (plugins, a , b) => {
					if (!plugins) {
						return;
					} else if (typeof plugins !== 'object') {
						throw new Error('PLUGIN_NOT_AN_OBJECT');
					}
					//log for verbosity the name of the plugins.
					if (Array.isArray([plugins])) { //multiple
						plugins.forEach((plugin) => {
							//the thing I hate with javascript developers is it is not strict in strategies
							//even hapi has no standard way and just getting a plugin name is all over the place
							let name = _.get(plugin, 'register.attributes.pkg.name') ||
								_.get(plugin, 'register.register.attributes.name') ||
								_.get(plugin, 'register.attributes.name') ||
								'unnamed-plugin';
							logger.info('bootstrap', 'loading hapi plugin ' + name);
						});
					} else {
						let name = _.get(plugin, 'register.attributes.pkg.name') ||
							_.get(plugin, 'register.register.attributes.name') ||
							_.get(plugin, 'register.attributes.name') ||
							'unnamed-plugin';
						logger.info('bootstrap', 'loading hapi plugin ' + name);
					}

					return _server.hapi.register(plugins);
				}
			});
		}
	}

	register(plugin) {
		//@todo: perform validations on the plugin
		return _server.hapi.register(plugin);
	}
}

module.exports = (server) => {
	return _singleton ? _singleton : _singleton = new PluginManager(server)
};