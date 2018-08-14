import moment from 'moment';
import mongoose from 'mongoose';

import db from '../utils/db';

import RSS from '../models/rss';
import Podcast from '../models/podcast';

import logger from '../utils/logger';
import weightedRandom from '../utils/random';
import { RssQueueAdd, PodcastQueueAdd } from '../asyncTasks';
import { isURL } from '../utils/validation';

const publicationTypes = {
	rss: { schema: RSS, enqueue: RssQueueAdd },
	podcast: { schema: Podcast, enqueue: PodcastQueueAdd },
};
const conductorInterval = 60;
const popularScrapeInterval = 2;
const defaultScrapeInterval = 25;

let timeout;

function forever() {
	conduct().then(()=> {
		logger.info('Conductor iteration completed...');
	}).catch(err => {
		logger.error('Conductor broke down', {err});
	});
	timeout = setTimeout(forever, conductorInterval * 1000);
}

if (require.main === module) {
	logger.info(`Starting the conductor... will conduct every ${conductorInterval} seconds`);

	forever();
}

function getPublications(schema, followerMin, followerMax, interval, limit, exclude=[]) {
	const time = moment().subtract(interval, 'minutes').toDate();
	return schema.find({
		_id: { $nin: exclude },
		valid: true,
		duplicateOf: { $exists : false },
		"queueState.isParsing": { $ne: true, },
		lastScraped: { $lte: time, },
		followerCount: { $gte: followerMin, $lte: followerMax },
		consecutiveScrapeFailures: { $lt: weightedRandom() }
	}).limit(limit).sort('-followerCount');
}

export async function conduct() {
	const publicationOptions = { removeOnComplete: true, removeOnFail: true };

	for (const [type, { schema, enqueue }] of Object.entries(publicationTypes)) {
		const total = await schema.count();
		//XXX: when running winds locally we can scrape more frequently
		const scrapeInterval = total < 1000 ? popularScrapeInterval : defaultScrapeInterval;
		// never schedule more than 1/15 per minute interval
		const maxToSchedule = Math.max(1, Math.floor(total / 15));
		logger.info(`conductor will schedule at most ${maxToSchedule} of type ${type} ` +
		            `to scrape per ${conductorInterval} seconds`);

		// find the publications that we need to update
		const limit = Math.max(1, maxToSchedule / 2);
		const popular = await getPublications(schema, 100, Number.POSITIVE_INFINITY, popularScrapeInterval, limit);
		const other = await getPublications(schema, 1, 100, scrapeInterval, limit, popular.map(p => p._id));
		logger.info(`found ${popular.length} popular publications of type ${type} that ` +
		            `we scrape every ${popularScrapeInterval} minutes and ` +
		            `${other.length} that we scrape every ${scrapeInterval} minutes`);
		const publications = popular.concat(other);

		// make sure we don't schedule these guys again till its finished
		const publicationIDs = publications.map(p => p._id);
		const updated = await schema.update(
			{ _id: { $in: publicationIDs } },
			{ "queueState.isParsing": true },
			{ multi: true },
		);
		logger.info(`marked ${updated.nModified} of type ${type} publications as isParsing`);
		logger.info(`conductor found ${publications.length} of type ${type} to scrape`);
		const validPublications = publications.filter(p => isURL(p.feedUrl));
		await Promise.all(validPublications.map(publication => {
			const job = { [type]: publication._id, url: publication.feedUrl };
			return enqueue(job, publicationOptions);
		}));

		logger.info(`Processing complete! Will try again in ${conductorInterval} seconds...`);
	}
}

function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		clearTimeout(timeout);
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during Conductor worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

function failure(err) {
	logger.error(`Unhandled error: ${err.message}. Shutting down.`);
	try {
		clearTimeout(timeout);
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during Conductor worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure);
process.on('uncaughtException', failure);
