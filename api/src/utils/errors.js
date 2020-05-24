import config from '../config';
import Raven from 'raven';
import path from 'path';
import logger from '../utils/logger';

let version;
if (process.env.DOCKER) {
	version = 'DOCKER';
} else {
	version = require('../../../app/package.json');
}

require.resolve('raven');

const executable = path.basename(process.argv[1]);
let ravenInstance;

function sendSourceMaps(data) {
	var stacktrace = data.exception && data.exception[0].stacktrace;
	if (stacktrace && stacktrace.frames) {
		stacktrace.frames.forEach(function (frame) {
			if (
				frame.filename.indexOf('/api/dist/') !== -1 &&
				frame.filename.indexOf('/node_modules/') === -1
			) {
				frame.filename = `app:///${frame.filename.split('api/dist/')[1]}`;
			}
		});
	}
	return data;
}

let sentryOptions = {
	dsn: config.sentry.dsn,
	level: 'error',
	patchGlobal: config.env === 'production',
	environment: config.env,
	tags: { script: executable },
	release: `v${version}`,
};

ravenInstance = Raven.config(sentryOptions.dsn, sentryOptions);

if (config.sentry.dsn) {
	ravenInstance.install();
}

function captureError(err, msg) {
	Raven.captureException(err);
}

exports.setupExpressRequestHandler = (app) => {
	if (config.sentry.dsn) {
		app.use(ravenInstance.requestHandler());
	}
};

exports.setupExpressErrorHandler = (app) => {
	if (config.sentry.dsn) {
		app.use(ravenInstance.errorHandler());
	}
	app.use(function (err, req, res, next) {
		var status =
			err.status ||
			err.statusCode ||
			err.status_code ||
			(err.output && err.output.statusCode) ||
			500;
		// skip anything not marked as an internal server error
		if (status < 500) return next(err);
		logger.error({ err });
		return next(err);
	});
};

exports.Throw = () => {
	throw new Error('test');
};

exports.Raven = ravenInstance;
exports.CaptureError = captureError;
