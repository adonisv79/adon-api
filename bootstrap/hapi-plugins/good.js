"use strict";

var Good = require('good'),
	Promise = require('bluebird');

module.exports = function goodConfiguration(server) {
	return new Promise(function (resolve, reject) {
		server.log(['info'], 'loading pluging:good...');
		server.register({
			register: Good,
			options: {
				reporters: {
					myConsoleReporter: [{
						module: 'good-squeeze',
						name: 'Squeeze',
						args: [{ log: '*', response: '*' }]
					}, {
						module: 'good-console'
					}, 'stdout']
				}
			}
		}, function (err) {
			if (err) {
				return reject(err);
			}
			server.log(['info'], 'loading pluging:good completed!');
			resolve(true);
		});
	});
};