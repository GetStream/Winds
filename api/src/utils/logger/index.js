import config from '../../config';
import winston from 'winston';
import { createSentryTransport } from './sentry';
import { Raven } from '../errors';
import CircularJSON from 'circular-json';
import { format } from 'logform';

// https://github.com/guzru/winston-sentry
const transports = [new winston.transports.Console({ level: 'silly' })];

if (config.sentry.dsn) {
	let sentryTransport = createSentryTransport(Raven);
	transports.push(sentryTransport);
}

let logger = winston.createLogger({
	format: format(function (info) {
		const stringifiedRest = CircularJSON.stringify(Object.assign({}, info, {
			level: undefined,
			message: undefined,
			splat: undefined
		}));

		if (stringifiedRest !== '{}') {
			info[Symbol.for('message')] = `${info.level}: ${info.message} ${stringifiedRest}`;
		} else {
			info[Symbol.for('message')] = `${info.level}: ${info.message}`;
		}

		return info;
	})(),
	transports: transports,
});

export default logger;
