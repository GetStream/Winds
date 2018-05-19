import '../loadenv';

import Queue from 'bull';

import stream from 'getstream';
import moment from 'moment';
import normalize from 'normalize-url';
import async from 'async';

import RSS from '../models/rss';
import Article from '../models/article';

import '../utils/db';
import config from '../config';
import logger from '../utils/logger';
import sendRssFeedToCollections from '../utils/events/sendRssFeedToCollections';
import { ParseFeed } from './parsers';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

const rssQueue = new Queue('rss', config.cache.uri);
const ogQueue = new Queue('og', config.cache.uri);

// connect the handler to the queue
logger.info('Starting the RSS worker');

rssQueue.process(25, (job, done) => {
	logger.info(`Processing RSS feed ${job.data.url}...`);

	// start by looking up the RSS object
	RSS.findById(job.data.rss).then(doc => {
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
						isParsing: true,
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
					let normalizedUrl = normalize(post.url);

					Article.findOneAndUpdate(
						{
							rss: job.data.rss,
							url: normalizedUrl,
						},
						{
							commentUrl: post.commentUrl,
							content: post.content,
							description: post.description,
							images: post.images || {},
							publicationDate: post.publicationDate,
							rss: job.data.rss,
							title: post.title,
							url: normalizedUrl,
						},
						{
							new: true,
							rawResult: true,
							upsert: true,
						},
					)
						.catch(err => {
							logger.error(
								`Failed to findOneAndUpdate for article with url ${normalizedUrl} ${err}`,
							);
							cb(null, null);
						})
						.then(rawArticle => {
							if (rawArticle.lastErrorObject.updatedExisting) {
								// article already exists
								cb(null, null);
								return;
							} else {
								let article = rawArticle.value;
								// after article is created, add to algolia, stream, and og scraper queue
								return ogQueue
									.add(
										{
											type: 'rss',
											url: article.url,
										},
										{
											removeOnComplete: true,
											removeOnFail: true,
										},
									)
									.then(function() {
										// this is just returning the article created from the MongoDB `create` call
										cb(null, article);
									})
									.catch(err => {
										// error: either adding to algolia, or adding to og queue - continuing on for the time being.
										logger.error(
											`failed to publish to ogQueue ${err}`,
										);
										cb(null, article);
									});
							}
						});
				},
				(err, allArticles) => {
					// updatedArticles will contain `null` for all articles that didn't get updated, that we alrady have in the system.
					let updatedArticles = allArticles.filter(updatedArticle => {
						return updatedArticle;
					});

					if (err) {
						logger.warn(
							`Scraping failed for ${job.data.url} with error ${err}`,
						);
						done(err);
					} else {
						if (updatedArticles.length > 0) {
							let chunkSize = 100;
							for (
								let i = 0, j = updatedArticles.length;
								i < j;
								i += chunkSize
							) {
								let chunk = updatedArticles.slice(i, i + chunkSize);

								let streamArticles = chunk.map(article => {
									return {
										actor: article.rss,
										foreign_id: `articles:${article._id}`,
										object: article._id,
										time: article.publicationDate,
										verb: 'rss_article',
									};
								});

								client
									.feed('rss', job.data.rss)
									.addActivities(streamArticles)
									.then(() => {
										return sendRssFeedToCollections(job.data.rss);
									})
									.then(() => {
										logger.info(
											`Completed scraping for ${job.data.url}`,
										);
										done();
									})
									.catch(err => {
										logger.warn(
											`Adding activities to Stream and personalization failed for ${
												job.data.url
											} with error ${err}`,
										);
										done(err);
									});

								RSS.findByIdAndUpdate(job.data.rss, {
									$set: {
										isParsing: false,
										lastScraped: moment().toISOString(),
									},
								})
									.then(res => {
										logger.info(
											`Completed scraping for ${job.data.url}`,
										);
									})
									.catch(err => {
										logger.error(err);
									});
							}
						} else {
							logger.info(`Completed scraping for ${job.data.url}`);
							done();
						}
					}
				},
			);
		});
	});
});
