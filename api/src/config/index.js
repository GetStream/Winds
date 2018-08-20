import dotenv from 'dotenv';
import path from 'path';

const configs = {
	development: { config: 'dev' },
	production: { config: 'prod' },
	test: {
		config: 'test',
		env: path.resolve(__dirname, '..', '..', 'test', '.env'),
	},
};

const currentEnvironment = process.env.NODE_ENV || 'development';

const defaultPath = path.resolve(__dirname, '..', '..', '..', 'app', '.env');
const envPath = configs[currentEnvironment].env || defaultPath;

console.log(`Loading .env from '${envPath}'`);
dotenv.config({ path: envPath });

const _default = {
	product: {
		url: process.env.PRODUCT_URL,
		name: process.env.PRODUCT_NAME,
		author: process.env.PRODUCT_AUTHOR,
	},
	server: {
		port: process.env.API_PORT,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
	},
	database: {
		uri: process.env.DATABASE_URI,
	},
	cache: {
		uri: process.env.CACHE_URI,
	},
	mercury: {
		key: process.env.MERCURY_KEY,
	},
	algolia: {
		appId: process.env.REACT_APP_ALGOLIA_APP_ID,
		writeKey: process.env.ALGOLIA_WRITE_KEY,
		index: process.env.ALGOLIA_INDEX,
	},
	logger: {
		level: process.env.LOGGER_LEVEL || 'warn',
		host: process.env.LOGGER_HOST,
		port: process.env.LOGGER_PORT,
	},
	sentry: {
		dsn: process.env.SENTRY_DSN,
	},
	url: process.env.BASE_URL,
	email: {
		backend: 'sendgrid',
		sender: {
			default: {
				name: process.env.EMAIL_SENDER_DEFAULT_NAME,
				email: process.env.EMAIL_SENDER_DEFAULT_EMAIL,
			},
			support: {
				name: process.env.EMAIL_SENDER_SUPPORT_NAME,
				email: process.env.EMAIL_SENDER_SUPPORT_EMAIL,
			},
		},
		sendgrid: {
			secret: process.env.EMAIL_SENDGRID_SECRET,
		},
	},
	stream: {
		appId: process.env.STREAM_APP_ID,
		apiKey: process.env.STREAM_API_KEY,
		apiSecret: process.env.STREAM_API_SECRET,
		baseUrl: process.env.STREAM_API_BASE_URL,
	},
	analyticsDisabled: process.env.ANALYTICS_DISABLED || false,
	statsd: {
		host: process.env.STATSD_HOST || 'localhost',
		port: process.env.STATSD_PORT || 8125,
		prefix: process.env.STATSD_PREFIX || '',
	},
	newrelic: false,
	social: {
		reddit: {
			username: process.env.REDDIT_USERNAME,
			password: process.env.REDDIT_PASSWORD,
			key: process.env.REDDIT_APP_ID,
			secret: process.env.REDDIT_APP_SECRET,
		},
	},
};

const config = require(`./${configs[currentEnvironment].config}`);

module.exports = Object.assign({ env: currentEnvironment }, _default, config);
