"use strict";
//This module loads up the routes into the server

function loadRoutes(server) {
	server.log(['info'], 'loading routes...');
	require('require-all')({
		dirname     :  __dirname + "../../../routes/auth",
		filter      :  /(.)\.js$/,
		recursive   : true,
		resolve : function (Route) {
			if (typeof Route !== 'function') {
				throw new Error('');
			}
			return new Route(server);
		}
	});

	server.log(['info'], 'loading routes completed!');
}

module.exports = loadRoutes;