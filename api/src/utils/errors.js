import config from '../config';
import Raven from 'raven';
import path from 'path';
import { version } from '../../../app/package.json';
require.resolve('raven');

const executable = path.basename(process.argv[1]);
var ravenInstance;

function sendSourceMaps(data){
	var stacktrace = data.exception && data.exception[0].stacktrace;
	if (stacktrace && stacktrace.frames) {
		stacktrace.frames.forEach(function(frame) {
			if (frame.filename.indexOf('/api/dist/') !== -1 && frame.filename.indexOf('/node_modules/') === -1) {
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
	dataCallback: sendSourceMaps,
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
	if (ravenInstance) {
		app.use(ravenInstance.requestHandler());
	}
};

exports.setupExpressErrorHandler = (app) => {
	if (ravenInstance) {
		app.use(ravenInstance.errorHandler());
	}
};

exports.Throw = () => {
	throw new Error('test');
};

exports.Raven = ravenInstance;
exports.CaptureError = captureError;
