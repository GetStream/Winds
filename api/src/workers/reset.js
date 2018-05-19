import '../loadenv';

import RSS from '../models/rss';

import '../utils/db';
import logger from '../utils/logger';

logger.info('Starting the RSS rest');

RSS.update({ isParsing: true }, { isParsing: false }, { multi: true })
	.then(res => {
		logger.info(`Completed update for all RSS feeds`);
	})
	.catch(err => {
		logger.error(err);
	});
