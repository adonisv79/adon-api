"use strict";
//This is the entry point for initializing the server API.
//its purpose is to manage ALL startup initializations that are needed by the server to run

const Promise = require('bluebird');

//bootstrap level 1 is for configurations and items that must be preloaded before runing any codes
function bootstrap1(server){
	return Promise.join(
		require('./configurations/environment')(server)
	).spread(function bootstrapResultCb(good, swagger) {
		return server ;
	});
}

//bootstrap level 2 is for plugins and module loading
//which might be needed first before any code that requires them makes a call
function bootstrap2(server){
	return Promise.join(
		require('./hapi-plugins/good')(server),
		require('./hapi-plugins/swagger')(server)
	).spread(function bootstrapResultCb(good, swagger) {
		return server ;
	});
}

//bootstrap level 3 is for loading of actual codes that the server will be runing like routes
function bootstrap3(server){
	return Promise.join(
		require('./routes')(server),
		require('./session')(server)
	).spread(function bootstrapResultCb(good, swagger) {
		return server ;
	});
}

function startServer(server){
	return new Promise(
		(resolve => {
			server.start(function (err) {
				server.log('start', 'Server started at: ' + server.info.uri);
			});
			resolve();
		})
	);
}

module.exports = function (server) {
	return Promise.resolve(server)
		.then(bootstrap1)
		.then(bootstrap2)
		.then(bootstrap3)
		.then(startServer);
};