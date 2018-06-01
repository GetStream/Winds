import config from '../../config';
import winston from 'winston';
import { createSentryTransport } from './sentry';
import { Raven } from '../errors';
import { format } from 'logform';

// https://github.com/guzru/winston-sentry
const transports = [new winston.transports.Console({ level: 'silly' })];
const MESSAGE = Symbol.for('message');

if (config.sentry.dsn) {
	transports.push(createSentryTransport(Raven));
}

function simpler(info) {
	const padding = (info.padding && info.padding[info.level]) || '';
	info[MESSAGE] = `${info.level}:${padding} ${info.message}`;
	return info;
}

const logger = winston.createLogger({
	format: format(simpler)(),
	transports: transports,
});

export default logger;
