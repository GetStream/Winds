import config from '../../config';
import winston from 'winston';
import { createSentryTransport } from './sentry';
import { Raven } from '../errors';

// https://github.com/guzru/winston-sentry
const transports = [new winston.transports.Console({ level: 'silly' })];

if (config.sentry.dsn) {
	let sentryTransport = createSentryTransport(Raven);
	transports.push(sentryTransport);
}

let logger = winston.createLogger({
	format: winston.format.simple(),
	transports: transports,
});

export default logger;
