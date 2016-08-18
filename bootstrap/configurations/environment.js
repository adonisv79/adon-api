"use strict";

const Promise = require('bluebird');
const url = require('url');

module.exports = function loadEnvConfiguration(server) {
	return new Promise(function (resolve) {
		server.log(['info'], 'loading environments...');
		let dotenvConfig = {},
			connectionOptions = {};

		//for development, use the specific config file for that environment,
		// other environments must use the .env file instead
		if(!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
			dotenvConfig.path = './.development.env';
		}
		require('dotenv').config(dotenvConfig);

		//Set the connections
		server.hostUrl = process.env.API_SERVER_HOST_URL ?
			url.parse(process.env.API_SERVER_HOST_URL) :
			url.parse('http://localhost:8000');

		connectionOptions.host = server.hostUrl.hostname;
		if (server.hostUrl.port) {
			connectionOptions.port = server.hostUrl.port;
		}

		server.connection(connectionOptions);
		server.log(['info'], 'loading environments complete!');
		resolve(server);
	});
};