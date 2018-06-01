import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import jwt from 'express-jwt';
import limit from 'express-rate-limit';

import config from './config';
import logger from './utils/logger';
import { setupExpressRequestHandler, setupExpressErrorHandler } from './utils/errors';
import User from './models/user';

const api = express();

setupExpressRequestHandler(api);

api.use(cors());
api.use(compression());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

api.enable('trust proxy');
api.use(
	new limit({
		windowMs: 60 * 1000,
		max: 100,
		delayMs: 0,
	}),
);

api.set('json spaces', 4);

api.use(
	jwt({ secret: config.jwt.secret }).unless({
		path: [
			'/',
			'/health',
			'/status',
			'/sentry/log',
			'/sentry/throw',
			'/auth/signup',
			'/auth/login',
			'/auth/forgot-password',
			'/auth/reset-password',
		],
	}),
);

api.use(async (req, res, next) => {
	// XXX: req.user is attached by JWT when a valid token is provided with the request
	// and the route requires authentication
	if (!req.user) {
		return next();
	}
	try {
		req.User = await User.findById(req.user.sub).exec();
		if (req.User === null) {
			res.status(401);
		}
	} catch (err) {
		next(err);
	}
	next();
});

api.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).send('Missing authentication credentials.');
	}
});

api.use((req, res, next) => {
	res.setHeader('X-Powered-By', 'Winds - Powered by GetStream.io');
	next();
});

fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
	require('./routes/' + file)(api);
});

if (require.main === module) {
	require('./utils/db');
	api.listen(config.server.port, err => {
		if (err) {
			logger.error(err);
			process.exit(1);
		}
		logger.info(`API is now running on port ${config.server.port} in ${config.env} mode`);
	});
}

setupExpressErrorHandler(api);

module.exports = api;
