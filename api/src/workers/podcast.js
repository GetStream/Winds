// this should be the first import
import '../loadenv';

import stream from 'getstream';
import normalize from 'normalize-url';
import moment from 'moment';

import Podcast from '../models/podcast';
import Episode from '../models/episode';

import '../utils/db';
import config from '../config';
import logger from '../utils/logger';
import sendPodcastToCollections from '../utils/events/sendPodcastToCollections';
import { ParsePodcast } from '../parsers/feed';

import {ProcessPodcastQueue, OgQueueAdd} from '../asyncTasks';
import { upsertManyPosts } from '../utils/upsert';


const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

// TODO: move this to separate main.js
logger.info('Starting to process podcasts....');
ProcessPodcastQueue(15, podcastProcessor);

// the top level handlePodcast just handles error handling
export async function podcastProcessor(job) {
	logger.info(`Processing ${job.data.url}`);
	try {
		await handlePodcast(job);
	} catch (err) {
		let tags = {queue: 'rss'};
		let extra = {
			JobPodcast: job.data.podcast,
			JobURL: job.data.url,
		};
		logger.error('Podcast job encountered an error', {err, tags, extra});
	}
}

// Handle Podcast scrapes the podcast and updates the episodes
export async function handlePodcast(job) {
	let podcastID = job.data.podcast;
	let podcast = await Podcast.findOne({ _id: podcastID });
	if (!podcast) {
		logger.warn(`Podcast with ID ${job.data.podcast} does not exist`);
		return;
	}

	// mark as done, will be schedule again in 15 min from now
	// we do this early so a temporary failure doesnt leave things in a broken state
	await markDone(podcastID);

	// parse the episodes
	let podcastContent;
	try {
		podcastContent = await ParsePodcast(job.data.url);
		await Podcast.resetScrapeFailures(podcastID);
	} catch (e) {
		logger.info(`podcast scraping broke for url ${job.data.url}`);
		await Podcast.incrScrapeFailures(podcastID);
		return;
	}

	// update the episodes
	logger.info(`Updating ${podcastContent.episodes.length} episodes`);
	let episodes = podcastContent.episodes
	for (let e of episodes) {
		e.podcast = podcastID
	}

	let operationMap = await upsertManyPosts(podcastID, episodes.slice(0,2), 'podcast')
	let updatedEpisodes = operationMap.new.concat(operationMap.changed)
	logger.info(`Finished updating ${updatedEpisodes.length} out of ${podcastContent.episodes.length} changed`)

	// update the count
	await Podcast.update(
		{ _id: podcastID },
		{
			postCount: await Episode.count({podcast: podcastID}),
		}
	);

	await Promise.all(updatedEpisodes.map( episode => {
		OgQueueAdd(
			{
				type: 'episode',
				url: episode.link,
			},
			{
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
	}));

	if (updatedEpisodes.length > 0) {
		let chunkSize = 100;
		let podcastFeed = streamClient.feed('podcast', podcastID);
		for (let i = 0, j = updatedEpisodes.length; i < j; i += chunkSize) {
			let chunk = updatedEpisodes.slice(i, i + chunkSize);
			let streamEpisodes = chunk.map(episode => {
				return {
					actor: episode.podcast,
					foreign_id: `episodes:${episode._id}`,
					object: episode._id,
					time: episode.publicationDate,
					verb: 'podcast_episode',
				};
			});

			// addActivities to Stream
			await podcastFeed.addActivities(streamEpisodes);
		}
		// update the collection information for follow suggestions
		await sendPodcastToCollections(podcast);
	}
}

// markDone sets lastScraped to now and isParsing to false
async function markDone(podcastID) {
	/*
	Set the last scraped for the given rssID
	*/
	let now = moment().toISOString();
	let updated = await Podcast.update(
		{ _id: podcastID },
		{
			lastScraped: now,
			isParsing: false,
		},
	);
	return updated;
}
