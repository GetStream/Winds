import joi from 'joi';
import moment from 'moment';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

import db from '../utils/db';

import Podcast from '../models/podcast';
import Episode from '../models/episode';

import logger from '../utils/logger';
import { sendFeedToCollections } from '../utils/collections';
import { ParsePodcast } from '../parsers/feed';

import { ProcessPodcastQueue, ShutDownPodcastQueue, StreamQueueAdd, OgQueueAdd } from '../asyncTasks';
import { upsertManyPosts } from '../utils/upsert';
import { getStreamClient } from '../utils/stream';
import { startSampling } from '../utils/watchdog';
import { ensureEncoded } from '../utils/urls';
import { getStatsDClient, timeIt } from '../utils/statsd';
import { tryCreateQueueFlag, removeFromQueueFlagSet } from '../utils/queue';

if (require.main === module) {
	EventEmitter.defaultMaxListeners = 128;

	logger.info('Starting to process podcasts....');
	ProcessPodcastQueue(35, podcastProcessor);

	startSampling('winds.event_loop.podcast.delay');
}

const streamTTL = 25200; // 7 hours
const statsd = getStatsDClient();

export async function podcastProcessor(job) {
	logger.info(`Processing ${job.data.url}`);
	try {
		await handlePodcast(job);
	} catch (err) {
		let tags = { queue: 'rss' };
		let extra = {
			JobPodcast: job.data.podcast,
			JobURL: job.data.url,
		};

		logger.error('Podcast job encountered an error', { err, tags, extra });
		statsd.increment('winds.handle_podcast.result.error');
	}
}

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/)
);
const joiUrl = joi.string().uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });

const schema = joi.object().keys({
	podcast: joiObjectId.required(),
	url: joiUrl.required(),
});

export async function handlePodcast(job) {
	try {
		// best effort at escaping urls found in the wild
		job.data.url = ensureEncoded(job.data.url);
	} catch (_) {
		//XXX: ignore error
	}

	let podcastID = job.data.podcast;

	await timeIt('winds.handle_podcast.ack', () => {
		return markDone(podcastID);
	});

	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(`Podcast job validation failed: ${validation.error.message} for '${JSON.stringify(job.data)}'`);
		await Podcast.incrScrapeFailures(podcastID);
		statsd.increment('winds.handle_podcast.result.validation_failed');
		return;
	}

	let podcast = await Podcast.findOne({ _id: podcastID });
	if (!podcast) {
		logger.warn(`Podcast with ID ${job.data.podcast} does not exist`);
		statsd.increment('winds.handle_podcast.result.model_instance_absent');
		return;
	}

	let podcastContent;
	try {
		podcastContent = await ParsePodcast(job.data.url);
		await Podcast.resetScrapeFailures(podcastID);
	} catch (err) {
		await Podcast.incrScrapeFailures(podcastID);
		logger.warn(`http request failed for url ${job.data.url}: ${err.message}`);
	}

	if (!podcastContent) {
		statsd.increment('winds.handle_podcast.result.no_content');
		return;
	}

	// update the episodes
	logger.debug(`Updating ${podcastContent.episodes.length} episodes`);
	let episodes = podcastContent.episodes;
	for (let e of episodes) {
		e.podcast = podcastID;
	}

	let operationMap = await upsertManyPosts(podcastID, episodes, 'podcast');
	let updatedEpisodes = operationMap.new.concat(operationMap.changed);
	logger.info(
		`Finished updating ${updatedEpisodes.length} out of ${
			podcastContent.episodes.length
		} changed`,
	);

	await Podcast.update({ _id: podcastID }, {
		postCount: await Episode.count({ podcast: podcastID }),
	});

	if (!updatedEpisodes.length) {
		statsd.increment('winds.handle_podcast.result.no_updates');
		return;
	}

	const chunkSize = 100;
	const podcastFeed = getStreamClient().feed('podcast', podcastID);
	for (let i = 0, j = updatedEpisodes.length; i < j; i += chunkSize) {
		const chunk = updatedEpisodes.slice(i, i + chunkSize);
		const streamEpisodes = chunk.map(episode => {
			return {
				actor: episode.podcast,
				foreign_id: `episodes:${episode._id}`,
				object: episode._id,
				time: episode.publicationDate,
				verb: 'podcast_episode',
			};
		});

		await podcastFeed.addActivities(streamEpisodes);
	}

	const queueOpts = { removeOnComplete: true, removeOnFail: true };
	const tasks = [];
	if (await tryCreateQueueFlag('og', 'podcast', podcastID)) {
		tasks.push(OgQueueAdd({ type: 'episode', podcast: podcastID, urls: updatedEpisodes.map(e => e.link) }, queueOpts));
	}
	if (await tryCreateQueueFlag('stream', 'podcast', podcastID, streamTTL)) {
		tasks.push(StreamQueueAdd({ podcast: podcastID }, queueOpts));
	}
	statsd.increment('winds.handle_podcast.result.updates');
}

// markDone sets lastScraped to now and isParsing to false
async function markDone(podcastID) {
	await removeFromQueueFlagSet('podcast', 'podcast', podcastID);
	return await Podcast.update({ _id: podcastID }, { lastScraped: moment().toISOString() });
}

async function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		await ShutDownPodcastQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during Podcast worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

async function failure(reason, err) {
	logger.error(`Unhandled ${reason}: ${err.stack}. Shutting down Podcast worker.`);
	try {
		await ShutDownPodcastQueue();
		mongoose.connection.close();
		statsd.increment('winds.handle_podcast.result.error');
	} catch (err) {
		logger.error(`Failure during Podcast worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));
