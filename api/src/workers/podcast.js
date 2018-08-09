import joi from 'joi';
import axios from 'axios';
import moment from 'moment';

import db from '../utils/db';

import Podcast from '../models/podcast';
import Episode from '../models/episode';

import logger from '../utils/logger';
import { sendFeedToCollections } from '../utils/collections';
import { ParsePodcast } from '../parsers/feed';

import { ProcessPodcastQueue, StreamQueueAdd, OgQueueAdd } from '../asyncTasks';
import { upsertManyPosts } from '../utils/upsert';
import { getStreamClient } from '../utils/stream';
import { setupAxiosRedirectInterceptor } from '../utils/axios';
import { ensureEncoded } from '../utils/urls';
import { timeIt } from '../utils/statsd';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);

	logger.info('Starting to process podcasts....');
	ProcessPodcastQueue(35, podcastProcessor);
}

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
		return;
	}

	let podcast = await Podcast.findOne({ _id: podcastID });
	if (!podcast) {
		logger.warn(`Podcast with ID ${job.data.podcast} does not exist`);
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
	const queueState = {};
	if (!podcast.queueState.isUpdatingOG) {
		queueState["queueState.isUpdatingOG"] = true;
		tasks.push(OgQueueAdd({ type: 'episode', podcast: podcastID, urls: updatedEpisodes.map(e => e.link) }, queueOpts));
	}
	if (!podcast.queueState.isSynchronizingWithStream) {
		queueState["queueState.isSynchronizingWithStream"] = true;
		tasks.push(StreamQueueAdd({ podcast: podcastID }, queueOpts));
	}
	await Promise.all([Podcast.update({ _id: podcastID }, queueState), ...tasks]);
}

// markDone sets lastScraped to now and isParsing to false
async function markDone(podcastID) {
	return await Podcast.update({ _id: podcastID }, { lastScraped: moment().toISOString(), "queueState.isParsing": false });
}
