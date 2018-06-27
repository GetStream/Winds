import fs from 'fs';
import path from 'path';
import Mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { stringify } from 'flatted/cjs';

import config from './src/config';
import api from './src/server';
import logger from './src/utils/logger';
import { dropDBs } from './test/utils';

api.use((err, req, res, next) => {
	if (err) {
		logger.error(err.stack);
		if (err.request) {
			logger.error(`REQUEST = ${stringify(err.request)}`);
		}
		if (err.response) {
			logger.error(`RESPONSE = ${stringify(err.response)}`);
		}
	}
	next(err, req, res);
});

chai.use(chaiHttp);

function wrapMocha(onPrepare, onUnprepare) {
	// Monkey-patch run method
	const run = Mocha.prototype.run;

	//XXX: using function syntax instead of fat-arrow syntax
	//     to avoid implicit binding of 'this'
	Mocha.prototype.run = function(done) {
		const self = this;
		onPrepare()
			.then(() => {
				//XXX: ditto
				run.call(self, function() {
					if (typeof onUnprepare === 'function') {
						onUnprepare.apply(this, arguments);
					}
					done.apply(this, arguments);
				});
			})
			.catch(err => {
				if (err instanceof Error) {
					console.error(err.stack);
				}
				process.exit(1);
			});
	};
}

wrapMocha(
	async () => {
		if (!config.database.uri)
			throw new Error('Missing MongoDB connection string. Check config');
		if (!config.cache.uri)
			throw new Error('Missing Redis connection string. Check config');
		if (
			!config.database.uri.includes('localhost') &&
			!config.database.uri.includes('127.0.0.1')
		)
			throw new Error(
				'MongoDB connection string contains non-local address. For safety reasons test suite can only connect to local databases. Check config',
			);
		if (
			!config.cache.uri.includes('localhost') &&
			!config.cache.uri.includes('127.0.0.1')
		)
			throw new Error(
				'Redis connection string contains non-local address. For safety reasons test suite can only connect to local databases. Check config',
			);

		//XXX: drop all data before running tests
		await dropDBs();

		fs.readdirSync(path.join(__dirname, 'src', 'routes')).forEach(file => {
			if (file.endsWith('.js')) {
				require(`./src/routes/${file}`)(api);
			}
		});
	},
	failures => {
		//XXX: it seems Travis-ci is having trouble with process wrap-up procedures so lets
		//     allocate more time before shutting down
		const timeout = process.env.TRAVIS ? 10000 : 1500;
		logger.info(`Terminating in ${timeout / 1000} seconds`);
		//XXX: don't care about open connections
		setTimeout(() => process.exit(failures ? 1 : 0), timeout);
	},
);
