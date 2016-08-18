"use strict";

let _ = require('lodash'),
	Promise = require('bluebird'),
	inert = require('inert'),
	vision = require('vision');

//register swagger into the root path
module.exports = function (server) {
	return new Promise(function (resolve, reject) {
		server.log(['info'], 'loading pluging:swagger...');
		if (process.env.NODE_ENV !== 'development') { // swagger should only be available in development
			return resolve();
		}

		server.register([
			inert,
			vision,
			{
				register: require('hapi-swagger'),
				options: {
					documentationPath: '/'
				}
			}
		], function (err) {
			if (err) {
				console.dir(err);
				reject(err);
			}
			server.log(['info'], 'loading pluging:swagger completed!');
			resolve(true);
		});
	});
};