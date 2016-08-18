'use strict';
const Promise = require('bluebird');
const Hapi = require('hapi');
const server = new Hapi.Server(
	{
		debug: { request: ['error', 'info', 'warn'] }
	}
);

Promise.resolve(server)
	.then(require('./bootstrap'))
	.catch(
		(err) => {
			console.log(err);
		}
	);