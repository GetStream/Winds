import fs from 'fs';
import path from 'path';
import prepare from 'mocha-prepare';
import chai from 'chai';
import chaiHttp from 'chai-http';
import redis from 'redis';
import { promisify } from 'util';

import config from './src/config';
import db from './src/utils/db';
import api from './src/server';
import logger from './src/utils/logger';

api.use((err, req, res, next) => {
	if (err) {
		logger.error(err);
	}
	next(err, req, res);
});

chai.use(chaiHttp);

prepare((done) => {
	if (!config.database.uri)
		throw new Error('Missing MongoDB connection string. Check config');
	if (!config.cache.uri)
		throw new Error('Missing Redis connection string. Check config');

	const redisClient = redis.createClient(config.cache.uri);

	//XXX: drop all data before running tests
	db.then((db) => {
		return db.connection.dropDatabase();
	}).then(() => {
		return promisify(redisClient.send_command.bind(redisClient))('FLUSHDB');
	}).then(() => {
		fs.readdirSync(path.join(__dirname, 'src', 'routes')).forEach(file => {
			if (file.endsWith('.js')) {
				require('./src/routes/' + file)(api);
			}
		});
	}).then(done).catch(done);
}, () => {
	// XXX: don't care about open connections
	setTimeout(process.exit, 3000);
});

