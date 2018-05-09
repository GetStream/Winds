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
import events from '../utils/events';
import { ParsePodcast } from './parsers';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

const podcastQueue = new Queue('podcast', config.cache.uri);

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
					return Episode.findOne({
						url: normalize(episode.url), // do not lowercase this - some podcast URLs are case-sensitive
					}).then(exists => {
						if (exists) {
							return exists;
						} else {
							return Episode.create({
								description: episode.description,
								podcast: job.data.podcast,
								publicationDate: episode.publicationDate,
								title: episode.title,
								url: episode.url,
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
										client
											.feed('podcast', episode.podcast)
											.addActivity({
												actor: episode.podcast,
												foreign_id: `episodes:${episode._id}`,
												object: episode._id,
												time: episode.publicationDate,
												verb: 'podcast_episode',
											}),
										Episode.find({ podcast: job.data.podcast }).then(
											episodes => {
												return events({
													meta: {
														data: {
															[`podcast:${
																job.data.podcast
															}`]: {
																episodeCount:
																	episodes.length,
															},
														},
													},
												});
											},
										),
									]);
								})
								.catch(err => {
									logger.error(err);
								});
						}
					});
				}),
			).then(() => {
				logger.info(`completed podcast ${job.data.url}`);
				done();
				return;
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
