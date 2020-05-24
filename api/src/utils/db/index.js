import mongoose from 'mongoose';

import config from '../../config';
import logger from '../logger';

mongoose.Promise = global.Promise;

const connection = mongoose.connect(config.database.uri, {
	autoIndex: true,
	reconnectTries: Number.MAX_VALUE,
	reconnectInterval: 500,
	poolSize: 50,
	bufferMaxEntries: 0,
	keepAlive: 120,
	useNewUrlParser: true,
});

connection
	.then((db) => {
		logger.info(
			`Successfully connected to ${config.database.uri} MongoDB cluster in ${config.env} mode.`,
		);
		return db;
	})
	.catch((err) => {
		if (err.message.code === 'ETIMEDOUT') {
			logger.info('Attempting to re-establish database connection.');
			mongoose.connect(config.database.uri);
		} else {
			logger.error('Error while attempting to connect to database:', { err });
		}
	});

export default connection;
