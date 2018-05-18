import '../loadenv';

import Queue from 'bull';

import async from 'async';
import moment from 'moment';

import RSS from '../models/rss';
import Podcast from '../models/podcast';

import db from '../utils/db';
import config from '../config';
import logger from '../utils/logger';

const rssQueue = new Queue('rss', config.cache.uri);
const podcastQueue = new Queue('podcast', config.cache.uri);

const conductor = () => {
	logger.info('Preparing for processing...');

	async.parallel(
		[
			cb => {
				RSS.count({})
					.then(count => {
						RSS.find({
							isParsing: {
								$ne: true,
							},
							lastScraped: {
								$lte: moment()
									.subtract(15, 'minutes')
									.toDate(),
							},
						})
							.limit(count / 15)
							.then(rssFeeds => {
								Promise.all(
									rssFeeds.map(rssFeed => {
										return RSS.findByIdAndUpdate(rssFeed._id, {
											isParsing: true,
										});
									}),
								).then(() => {
									cb(null, rssFeeds);
								});
							})
							.catch(err => {
								cb(err);
							});
					})
					.catch(err => {
						cb(err);
					});
			},
			cb => {
				Podcast.count({})
					.then(count => {
						Podcast.find({
							lastScraped: {
								$lte: moment()
									.subtract(15, 'minutes')
									.toDate(),
							},
						})
							.limit(count / 15)
							.then(feeds => {
								cb(null, feeds);
							})
							.catch(err => {
								cb(err);
							});
					})
					.catch(err => {
						cb(err);
					});
			},
		],
		(err, results) => {
			if (err) {
				logger.info(err);
				return;
			}

			if (!results[0].length && !results[1].length) {
				logger.info('No feeds to update at this time...');
				return;
			}

			const rssFeeds = results[0].filter(val => {
				return val.feedUrl;
			});

			const podcastFeeds = results[1].filter(val => {
				return val.feedUrl;
			});

			for (let rss of rssFeeds) {
				rssQueue.add(
					{
						rss: rss._id,
						url: rss.feedUrl,
					},
					{
						removeOnComplete: true,
						removeOnFail: true,
					},
				);

				logger.info(`Enqueuing ${rss.url} for RSS processing...`);
			}

			logger.info(`found ${podcastFeeds.length} podcasts`);

			for (let podcast of podcastFeeds) {
				podcastQueue.add(
					{
						podcast: podcast._id,
						url: podcast.feedUrl,
					},

					{
						removeOnComplete: true,
						removeOnFail: true,
					},
				);

				logger.info(`Enqueuing ${podcast.url} for podcast processing...`);
			}

			logger.info('Processing complete! Will try again in 60s...');
		},
	);

	setTimeout(conductor, 60 * 1000);
};

conductor();
