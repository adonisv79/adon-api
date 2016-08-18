"use strict";
const Joi = require('joi');
const Boom = require('boom');

function Route (server) {
	server.log(['info'], 'adding route: POST auth/session...');
	server.route({
		method: 'POST',
		path: '/auth/session',
		config: {
			description: 'Creates a new session information for the user',
			notes: 'Use this when trying to start a new connection, the token retrieved should be used as a bearer token in header',
			tags: [ 'api' ]
		},
		handler: function (req, rep) {
			require('crypto').randomBytes(48, function(err, buffer) {
				var token = buffer.toString('hex');
				server.app.session.setValue(token, JSON.stringify({
					address: req.info.remoteAddress,
					port: req.info.remotePort,
					created: Date.now()
				}));
				return rep({ token });
			});
		}
	});

	server.log(['info'], 'adding route: POST auth/session completed!');
}

module.exports = Route;
