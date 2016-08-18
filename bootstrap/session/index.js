"use strict";

const redis = require("redis").createClient();

class SessionManager {
	constructor() {
	}

	getValue (key) {
		return new Promise((resolve, reject) => {
			redis.get(key, function(err, result) {
				if (err) return reject(err);
				resolve(result);
			});
		});
	}

	setValue (key, value) {
		redis.set(key, value);
	}
}

function s(server) {
	server.app.session = new SessionManager();
}

module.exports = s;