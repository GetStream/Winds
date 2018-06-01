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
import { ParsePodcast } from '../parsers';
import util from 'util';

import async_tasks from '../async_tasks';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

// TODO: move this to separate main.js
logger.info('Starting to process podcasts....');
async_tasks.ProcessPodcastQueue(5, handlePodcast);

// the top level handlePodcast just handles error handling
async function handlePodcast(job) {
	logger.info(`Processing ${job.data.url}`);
	try {
		await _handlePodcast(job);
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
async function _handlePodcast(job) {
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
		podcastContent = await util.promisify(ParsePodcast)(job.data.url);
	} catch (e) {
		logger.info(`podcast scraping broke for url ${job.data.url}`);
		return;
	}

	// update the episodes
	logger.info(`Updating ${podcastContent.episodes.length} episodes`);
	let allEpisodes = await Promise.all(
		podcastContent.episodes.map(episode => {
			let normalizedUrl = normalize(episode.url);
			episode.url = normalizedUrl;
			return upsertEpisode(podcast._id, normalizedUrl, episode);
		}),
	);

	// Only send updated episodes to Stream
	let updatedEpisodes = allEpisodes.filter(updatedEpisode => {
		return updatedEpisode && updatedEpisode.link;
	});

	await Promise.all(updatedEpisodes.map( episode => {
		async_tasks.OgQueueAdd(
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

// updateEpisode updates 1 episode and sync the data to og scraping
async function upsertEpisode(podcastID, normalizedUrl, episode) {
	let update = {
		description: episode.description,
		duration: episode.duration,
		enclosure: episode.enclosure,
		images: episode.images,
		link: episode.link,
		podcast: podcastID,
		publicationDate: episode.publicationDate,
		title: episode.title,
		url: episode.url,
	};

	try {
		return await Episode.findOneAndUpdate(
			{
				$and: [
					{
						podcast: podcastID,
						url: normalizedUrl,
					},
					{
						$or: Object.keys(update).map(k => {
							return {
								[k]: {
									$ne: update[k],
								},
							};
						}),
					},
				],
			},
			update,
			{
				new: true,
				upsert: true,
			},
		);
	} catch(err) {
		if (err.code === 11000){
			return null;
		} else {
			throw err;
		}
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
