import '../loadenv';

import RSS from '../models/rss';
import Podcast from '../models/podcast';

import '../utils/db';
import logger from '../utils/logger';

logger.info('Starting the RSS reset');

// simple script to reset isParsing state on Podcast and RSS feeds
async function main() {
	logger.info('Updating RSS feeds now');
	let rssResponse = await RSS.update(
		{},
		{ 'queueState.isParsing': false },
		{ multi: true },
	);
	logger.info(`Updated isParsing to false for ${rssResponse.nModified} RSS feeds`);

	logger.info('Updating Podcast feeds now');
	let podcastResponse = await Podcast.update(
		{},
		{ 'queueState.isParsing': false },
		{ multi: true },
	);
	logger.info(
		`Updated isParsing to false for ${podcastResponse.nModified} Podcast feeds`,
	);
}

main()
	.then(() => {
		logger.info('Finished reset for podcast and rss feeds');
	})
	.catch(err => {
		logger.error(`Something went wrong with the reset ${err}`);
	});
