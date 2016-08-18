"use strict";

const Joi = require('joi');
const Boom = require('boom');

function Route (server) {
	server.log(['info'], 'adding route: GET auth/session...');
	server.route({
		method: 'GET',
		path: '/auth/session',
		config: {
			description: 'Gets the session information of the user',
			notes: 'Use this when trying to retrieve information about the owner of the lenddo access token',
			tags: [ 'api' ],
			validate: {
				headers: Joi.object( {
					authorization : Joi.string().required().min(10).max(100).description('The authorization string in the format of "[type] [token]"'),
				}).options({ allowUnknown: true })
			}
		},
		handler: function (req, rep) {
			//if ( req.auth.error) {
			//	rep(Boom.badImplementation(req.auth.error));
			//} else if (!req.auth.isAuthenticated) {
			//	rep(Boom.unauthorized('Authentication failed'));
			//} else if (!req.auth.credentials) {
			//	rep(Boom.unauthorized('No credentials provided'));
			//}

			server.app.session.getValue(req.headers.authorization)
				.then((result) => {
					try {
						result = JSON.parse(result);
					} catch (e) {
						result = { message : 'invalid session'};
					}
					return rep(result);
				});
		}
	});
	server.log(['info'], 'adding route: GET auth/session completed!');
}

module.exports = Route;