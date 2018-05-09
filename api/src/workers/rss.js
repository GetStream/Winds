import '../loadenv';

import Queue from 'bull';

import stream from 'getstream';
import moment from 'moment';
import normalize from 'normalize-url';

import RSS from '../models/rss';
import Article from '../models/article';
import async from 'async';

import '../utils/db';
import config from '../config';
import logger from '../utils/logger';
import search from '../utils/search';
import events from '../utils/events';
import { ParseFeed } from './parsers';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

const rssQueue = new Queue('rss', config.cache.uri);
const ogQueue = new Queue('og', config.cache.uri);

// connect the handler to the queue
logger.info('Starting the RSS worker');

rssQueue.process((job, done) => {
	logger.info(`Processing RSS feed ${job.data.url}...`);

	// start by looking up the RSS object
	RSS.findOne({ _id: job.data.rss }).then(doc => {
		if (!doc) {
			return done(new Error('RSS feed does not exist.'));
		}

		// update the feed
		ParseFeed(job.data.url, function(feedContents, err) {
			// log the error
			if (err) {
				logger.error(err);
				done(err);
				return;
			}

			// mark it done (even if we have a failure)
			// set last scraped date on rss object in DB
			RSS.findByIdAndUpdate(
				job.data.rss,
				{
					$set: {
						isParsing: false,
						lastScraped: moment().toISOString(),
					},
				},
				{
					new: true,
					upsert: false,
				},
			).catch(err => {
				logger.error(err);
			});

			// process all the feedContents we found
			async.mapLimit(
				feedContents.articles,
				10,
				(post, cb) => {
					// lookup by url
					Article.findOne({ url: normalize(post.url) }).then(article => {
						if (article) {
							// article already exists
							cb(null, article);
							return;
						} else {
							Article.create({
								description: post.description,
								publicationDate: post.publicationDate,
								rss: job.data.rss,
								title: post.title,
								url: post.url,
							}).then(article => {
								// after article is created, add to algolia, stream, and opengraph scraper queue
								return Promise.all([
									search({
										_id: article._id,
										description: article.description,
										publicationDate: article.publicationDate,
										rss: article.rss,
										title: article.title,
										type: 'article',
									}),
									client.feed('rss', article.rss).addActivity({
										actor: article.rss,
										foreign_id: `articles:${article._id}`,
										object: article._id,
										time: article.publicationDate,
										verb: 'rss_article',
									}),
									ogQueue.add(
										{
											url: normalize(article.url),
										},
										{
											removeOnComplete: true,
											removeOnFail: true,
										},
									),
									Article.find({ rss: job.data.rss }).then(articles => {
										return events({
											meta: {
												data: {
													[`rss:${job.data.rss}`]: {
														articleCount: articles.length,
													},
												},
											},
										});
									}),
								])
									.then(function() {
										// this is just returning the article created from the MongoDB `create` call
										cb(null, article);
									})
									.catch(err => {
										// error: either adding to algolia, adding to Stream, or adding to OGqueue - continuing on for the time being.
										logger.error(err);
										cb(null, article);
									});
							});
						}
					});
				},
				err => {
					if (err) {
						logger.warn(
							`Scraping failed for ${job.data.url} with error ${err}`,
						);
						done(err);
					} else {
						logger.info(`Completed scraping for ${job.data.url}`);
						done();
					}
				},
			);
		});
	});
});
