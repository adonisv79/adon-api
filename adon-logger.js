"use strict";
const intel = require('intel');
const LOG_LEVELS = [ 'trace', 'verbose', 'debug', 'info', 'warn', 'error', 'critical' ];
let _log_level;

function getReadableDate() {
	const d = new Date();
	return d.getFullYear() + '-' + (d.getMonth() +1) + '-' + d.getDate() + ' ' +
		d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();
}

function log(level = 'info', sender = 'unknown', message = '{no message}', data) {
	if (LOG_LEVELS.indexOf(level) < 0 ) {
		const error = new Error('INVALID_LOG_LEVEL');
		error.name = 'LoggerError';
		throw error;
	}

	if (!data) {
		intel[level]('[' + getReadableDate() + '][' + sender.toUpperCase() + '] ' + message);
	} else {
		intel[level]('[' + getReadableDate() + '][' + sender.toUpperCase() + '] ' + message, data);
	}
}

class AdonLogger {
	constructor(log_level = 'TRACE') {
		log_level = log_level.toUpperCase(); //ensure caps
		if (!intel[log_level]) {
			return intel.critical('Tried to assign non-existing level:' + log_level);
		}
		_log_level = log_level;
		intel.setLevel(intel[log_level]);
	}

	get logLevel() {
		return _log_level;
	}

	set logLevel(val) {
		val = val.toUpperCase(); //ensure caps
		if (!intel[log_level]) {
			return intel.critical('Tried to assign non-existing level:' + log_level);
		}
		_log_level = val;
		intel.setLevel(intel[_log_level]);
	}

	trace (sender, message, data) {
		log('trace', sender, message, data);
	}

	verbose (sender, message, data) {
		log('verbose', sender, message, data);
	}

	debug (sender, message, data) {
		log('debug', sender, message, data);
	}

	info (sender, message, data) {
		log('info', sender, message, data);
	}

	warn (sender, message, data) {
		log('warn', sender, message, data);
	}

	error (sender, message, data) {
		log('error', sender, message, data);
	}

	critical (sender, message, data) {
		log('critical', sender, message, data);
	}
}

module.exports = AdonLogger;