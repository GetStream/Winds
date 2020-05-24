import Transport from 'winston-transport';

const winstonLevelToSentryLevel = {
	silly: 'debug',
	verbose: 'debug',
	info: 'info',
	debug: 'debug',
	warn: 'warning',
	error: 'error',
};

/**
 * @param {Error} error
 */
const errorHandler = (error) => {
	console.log(error);
};

let isError = function (e) {
	return e && e.stack && e.message;
};

/**
 * @param {{}} info
 * @param {string} info.level
 * @return {{}}
 */
const prepareMeta = (info) => {
	let msg = info.message;
	let extra = Object.assign({}, info.extra || {});
	let hasError = false;

	if (isError(info)) {
		hasError = true;
		msg = info;
		extra.stackError = info.stack;
	} else if (isError(info.message)) {
		hasError = true;
		msg = info.message;
		extra.stackError = info.message.stack;
	} else if (isError(info.err)) {
		msg = info.err;
		hasError = true;
		extra.stackError = info.err.stack;
	} else if (info.message && isError(info.message.err)) {
		msg = info.message.err;
		hasError = true;
		extra.stackError = info.message.err.stack;
	}

	return [
		hasError,
		msg,
		{
			level: winstonLevelToSentryLevel[info.level],
			tags: info.tags || {},
			extra,
		},
	];
};

class SentryWinstonTransport extends Transport {
	constructor(options) {
		super(options);

		this.options = Object.assign(
			{
				dsn: '',
				patchGlobal: false,
				install: false,
				tags: {},
				extra: {},
				errorHandler,
			},
			options,
		);
	}

	/**
	 * @param {{}} info
	 * @param {string} info.level
	 * @param {Error|string} info.message
	 * @param {Function} done
	 */
	async log(info, done) {
		if (this.silent) return done(null, true);
		let [hasError, msg, meta] = prepareMeta(info);

		let method = hasError ? 'captureException' : 'captureMessage';
		try {
			let eventId = await this.raven[method](msg, meta);
			done(null, eventId);
		} catch (error) {
			done(error);
		}
	}
}
SentryWinstonTransport.prototype.name = 'sentry';

function createSentryTransport(ravenInstance) {
	let transport = new SentryWinstonTransport({ level: 'error' });
	transport.raven = ravenInstance;
	return transport;
}

module.exports.createSentryTransport = createSentryTransport;
