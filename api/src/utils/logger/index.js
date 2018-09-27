import winston from 'winston';
import { inspect } from 'util';

import config from '../../config';
import { createSentryTransport } from './sentry';
import { Raven } from '../errors';

const { format } = winston;

function isError(e) {
	return e && e.stack && e.message;
}

const warnAboutWinston = format(info => {
	if (isError(info)) {
		console.log(
			'You should use logger.error(err). Please use logger.error({err}) instead.',
		);
		return false;
	}
	return info;
});

const sillyWinstonConsoleFormatter = format.printf(info => {
	let message = info.message;
	if (isError(message)) {
		message = `${message.stack}`;
	} else if (isError(info.err)) {
		message = `${message} ${info.err.stack}`;
	} else if (message && isError(message.err)) {
		message = `${message} ${message.err.stack}`;
	}
	const meta = info.meta !== undefined ? inspect(info.meta, { depth: null }) : '';
	return `[${info.timestamp}] ${info.level}: ${message} ${meta}`;
});

const logger = winston.createLogger({
	level: config.logger.level,
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
		warnAboutWinston(),
		sillyWinstonConsoleFormatter,
	),
	transports: [new winston.transports.Console()],
});

if (config.sentry.dsn) {
	logger.add(createSentryTransport(Raven));
}

export default logger;
