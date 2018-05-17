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

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

const podcastQueue = new Queue('podcast', config.cache.uri);
const ogQueue = new Queue('og', config.cache.uri);

logger.info('Starting to process podcasts....');

podcastQueue.process((job, done) => {
	logger.info(`Processing ${job.data.url}`);

	Podcast.findOne({ _id: job.data.podcast }).then(doc => {
		if (!doc) {
			return done(new Error('Podcast feed does not exist.'));
		}

		ParsePodcast(job.data.url, function(podcastContents, err) {
			// mark as done
			setLastScraped(job.data.podcast);

			// log the error
			if (err) {
				logger.error(err);
				return done(err);
			}

			logger.debug(`updating ${podcastContents.episodes.length} episodes`);

			// actually store the episodes
			return Promise.all(
				podcastContents.episodes.map(episode => {
					let normalizedUrl = normalize(episode.url);
					return Episode.findOne({
						url: normalizedUrl, // do not lowercase this - some podcast URLs are case-sensitive
						podcast: job.data.podcast,
					}).then(exists => {
						if (exists) {
							return null;
						} else {
							return Episode.create({
								description: episode.description,
								podcast: job.data.podcast,
								publicationDate: episode.publicationDate,
								duration: episode.duration,
								title: episode.title,
								url: normalizedUrl,
								link: episode.link,
								enclosure: episode.enclosure,
								images: episode.images
							})
								.then(episode => {
									return Promise.all([
										search({
											_id: episode._id,
											description: episode.description,
											podcast: episode.podcast,
											publicationDate: episode.publicationDate,
											title: episode.title,
											type: 'episode',
										}),
										ogQueue.add(
											{
												url: episode.url,
												type: 'episode',
											},
											{
												removeOnComplete: true,
												removeOnFail: true,
											},
										),
									]).then(() => {
										return episode;
									});
								})
								.then(() => {
									return episode;
								});
						}
					});
				}),
			)
				.then(allEpisodes => {
					let updatedEpisodes = allEpisodes.filter(updatedEpisode => {
						return updatedEpisode;
					});

					if (updatedEpisodes.length > 0) {
						let chunkSize = 100;
						for (let i=0,j=updatedEpisodes.length; i<j; i+=chunkSize) {
						    let chunk = updatedEpisodes.slice(i,i+chunkSize);
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
								client
									.feed('podcast', job.data.podcast)
									.addActivities(streamEpisodes)
									.then(() => {
										sendPodcastToCollections(job.data.podcast);
									});
						}


					}

					logger.info(`Completed podcast ${job.data.url}`);
					done();
					return;
				})
				.catch(err => {
					logger.error(err);
				});
		});
	});
});

function setLastScraped(podcastID) {
	/*
	Set the last scraped for the given rssID
	*/
	let now = moment().toISOString();
	Podcast.findByIdAndUpdate(
		podcastID,
		{
			$set: {
				lastScraped: now,
			},
		},
		{
			new: true,
			upsert: false,
		},
	).catch(err => {
		logger.error(err);
	});
}
