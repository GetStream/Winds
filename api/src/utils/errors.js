import config from '../config';
import winston from 'winston';
import Raven from 'raven';
import path from 'path';
const executable = path.basename(process.argv[1]);

// https://github.com/guzru/winston-sentry
var ravenInstance

let sentryOptions = {
	dsn: config.sentry.dsn,
	level: 'warn',
	patchGlobal: config.env == 'production',
  tags: { key: executable },
}
ravenInstance = Raven.config(sentryOptions.dsn, sentryOptions);
ravenInstance.install()

function captureError(err, msg) {
  Raven.captureException(err)
}

exports.Raven = ravenInstance
exports.CaptureError = captureError
