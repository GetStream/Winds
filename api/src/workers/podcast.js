// this should be the first import
import '../loadenv';

import Queue from 'bull';

import stream from 'getstream';
import normalize from 'normalize-url';
import moment from 'moment';

import Podcast from '../models/podcast';
import Episode from '../models/episode';

import '../utils/db';
import config from '../config';
import logger from '../utils/logger';
import search from '../utils/search';
import sendPodcastToCollections from '../utils/events/sendPodcastToCollections';
import { ParsePodcast } from './parsers';
import util from 'util';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

const podcastQueue = new Queue('podcast', config.cache.uri);
const ogQueue = new Queue('og', config.cache.uri);

logger.info('Starting to process podcasts....');

podcastQueue.process(10, handlePodcast);

// Handle Podcast scrapes the podcast and updates the episodes
async function handlePodcast(job) {
	logger.info(`Processing ${job.data.url}`);

	// verify we have the podcast object
	let podcastID = job.data.podcast;
	let podcast = await Podcast.findOne({ _id: podcastID });
	if (!podcast) {
		logger.warn(`Podcast with ID ${job.data.podcast} does not exist`);
		return;
	}

	// mark as done, will be schedule again in 15 min from now
	// we do this early so a temporary failure doesnt leave things in a broken state
	let completed = await markDone(podcastID);

	// parse the episodes
	try {
		let podcastContent = await util.promisify(ParsePodcast)(job.data.url);
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
			return updateEpisode(podcast._id, normalizedUrl, episode);
		}),
	);

	// Only send updated episodes to Stream
	let updatedEpisodes = allEpisodes.filter(updatedEpisode => {
		return updatedEpisode;
	});

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
			let streamResponse = await podcastFeed.addActivities(streamEpisodes);
			// update the collection information for follow suggestions
			let collectionResponse = await sendPodcastToCollections(podcastID);
		}
	}
}

// updateEpisode updates 1 episode and sync the data to og scraping
async function updateEpisode(podcastID, normalizedUrl, episode) {
	let rawEpisode = await Episode.findOneAndUpdate(
		{
			podcast: podcastID,
			url: normalizedUrl, // do not lowercase this - some podcast URLs are case-sensitive
		},
		{
			description: episode.description,
			duration: episode.duration,
			enclosure: episode.enclosure,
			images: episode.images,
			link: episode.link,
			podcast: podcastID,
			publicationDate: episode.publicationDate,
			title: episode.title,
			url: episode.url,
		},
		{
			new: true,
			rawResult: true,
			upsert: true,
		},
	);
	let newEpisode = rawEpisode.value;
	if (rawEpisode.lastErrorObject.updatedExisting) {
		return;
	} else if (newEpisode.link) {
		await ogQueue.add(
			{
				type: 'episode',
				url: newEpisode.link,
			},
			{
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
		return newEpisode;
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
