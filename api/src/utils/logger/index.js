import config from '../../config';
import winston from 'winston';
import { createSentryTransport } from './sentry';
import { Raven } from '../errors';
const { format } = require('winston');

const warnAboutWinston = format((info) => {
	if (isError(info)) {
		console.log('You should use logger.error(err). Please use logger.error({err}) instead.');
		return false;
	}
	return info;
});

let isError = function(e){
	return e && e.stack && e.message;
};

const sillyWinstonConsoleFormatter = format((info) => {
	let clone = Object.assign(info);
	if (isError(info.message)) {
		clone.message = `${info.message.message} ${info.message.stack}`;
	} else if (isError(info.err)) {
		clone.message = `${info.err.message} ${info.err.stack}`;
	} else if (info.message && isError(info.message.err)) {
		clone.message = `${info.message.err.message} ${info.message.err.stack}`;
	}
	return clone;
});

const logger = winston.createLogger({
	level: 'silly',
	format: warnAboutWinston(),
	transports: [new winston.transports.Console({
		format: format.combine(
			sillyWinstonConsoleFormatter(),
			winston.format.simple(),
		),
	})],
});

if (config.sentry.dsn) {
	let sentryTransport = createSentryTransport(Raven);
	logger.add(sentryTransport);
}

export default logger;
