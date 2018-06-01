import '../loadenv';

import stream from 'getstream';
import moment from 'moment';
import normalize from 'normalize-url';

import RSS from '../models/rss';
import Article from '../models/article';

import '../utils/db';
import config from '../config';
import logger from '../utils/logger';

import sendRssFeedToCollections from '../utils/events/sendRssFeedToCollections';
import { ParseFeed } from '../parsers';

import async_tasks from '../async_tasks';
import { getStatsDClient, timeIt } from '../utils/statsd';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

// connect the handler to the queue
logger.info('Starting the RSS worker');

// TODO: move this to a separate main.js
async_tasks.ProcessRssQueue(100, handleRSS);

const statsd = getStatsDClient();

// the top level handleRSS just intercepts error handling before it goes to Bull
async function handleRSS(job) {
	logger.info(`Processing ${job.data.url}`);
	try {
		await _handleRSS(job);
	} catch (err) {
		let tags = {queue: 'rss'};
		let extra = {
			JobRSS: job.data.rss,
			JobURL: job.data.url,
		};
		logger.error('RSS job encountered an error', {err, tags, extra});
	}
	logger.info(`Completed scraping for ${job.data.url}`);
}

// Handle Podcast scrapes the podcast and updates the episodes
async function _handleRSS(job) {
	let rssID = job.data.rss;

	await timeIt('winds.handle_rss.ack', () => {
		return markDone(rssID);
	});

	let rss = await timeIt('winds.handle_rss.get_rss', () => {
		return RSS.findOne({ _id: rssID });
	});

	if (!rss) {
		logger.warn(`RSS with ID ${rssID} does not exist`);
		return;
	}

	logger.info(`Marked ${rssID} as done`);

	// parse the articles
	let rssContent = await timeIt('winds.handle_rss.parsing', () => {
		return ParseFeed(job.data.url);
	});

	if (!rssContent) {
		return;
	}

	// update the articles
	logger.info(`Updating ${rssContent.articles.length} articles for feed ${rssID}`);

	if (rssContent.articles.length === 0) {
		return;
	}

	statsd.increment('winds.handle_rss.articles.parsed', rssContent.articles.length);
	statsd.timing('winds.handle_rss.articles.parsed', rssContent.articles.length);

	let allArticles = await timeIt('winds.handle_rss.upsertManyArticles', () => {
		let articles = rssContent.articles.map(a => {
			a.url = normalize(a.url);
			return a;
		});
		return upsertManyArticles(rssID, articles);
	});

	// updatedArticles will contain `null` for all articles that didn't get updated, that we already have in the system.
	let updatedArticles = allArticles.filter(updatedArticle => {
		return updatedArticle;
	});

	statsd.increment('winds.handle_rss.articles.upserted', updatedArticles.length);

	await timeIt('winds.handle_rss.OgQueueAdd', () => {
		return Promise.all(
			updatedArticles.map(article => {
				async_tasks.OgQueueAdd(
					{
						type: 'rss',
						url: article.url,
					},
					{
						removeOnComplete: true,
						removeOnFail: true,
					}
				);
			})
		);
	});

	let t0 = new Date();
	let rssFeed = streamClient.feed('rss', rssID);
	logger.info(`Syncing ${updatedArticles.length} articles to Stream`);
	if (updatedArticles.length > 0) {
		let chunkSize = 100;
		for (let i = 0, j = updatedArticles.length; i < j; i += chunkSize) {
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
			await rssFeed.addActivities(streamArticles);
		}
		await sendRssFeedToCollections(rss);
	}
	statsd.timing('winds.handle_rss.send_to_stream', new Date() - t0);
}

async function upsertManyArticles(rssID, articles) {
	let searchData = articles.map(article => {
		const clone = Object.assign({}, article);
		delete clone.images;
		delete clone.publicationDate;
		return clone;
	});

	let existingArticles = await Article.find({ $or: searchData }, { url: 1 }).read(
		'sp'
	);
	let existingArticleUrls = existingArticles.map(a => {
		return a.url;
	});

	statsd.increment(
		'winds.handle_rss.articles.already_in_mongo',
		existingArticleUrls.length
	);

	let articlesToUpsert = articles.filter(article => {
		return existingArticleUrls.indexOf(article.url) === -1;
	});

	logger.info(
		`Feed ${rssID}: got ${articles.length} articles of which ${
			articlesToUpsert.length
		} need a sync`
	);

	return Promise.all(
		articlesToUpsert.map(article => {
			return upsertArticle(rssID, article);
		})
	);
}

// updateArticle updates the article in mongodb if it changed and create a new one if it did not exist
async function upsertArticle(rssID, post) {
	let search = {
		commentUrl: post.commentUrl,
		content: post.content,
		description: post.description,
		title: post.title,
	};

	let update = Object.assign({}, search);
	update.url = post.url;
	update.rss = rssID;

	let defaults = {
		enclosures: post.enclosures || {},
		images: post.images || {},
		publicationDate: post.publicationDate,
	};

	try {
		let rawArticle = await Article.findOneAndUpdate(
			{
				$and: [
					{
						rss: rssID,
						url: post.url,
					},
					{
						$or: Object.keys(search).map(k => {
							return {
								[k]: {
									$ne: search[k],
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
				rawResult: true,
				setDefaultsOnInsert: defaults,
			}
		);
		if (!rawArticle.lastErrorObject.updatedExisting) {
			return rawArticle.value;
		}
	} catch (err) {
		if (err.code === 11000) {
			statsd.increment('winds.handle_rss.articles.ignored');
			return null;
		} else {
			throw err;
		}
	}
}

// markDone sets lastScraped to now and isParsing to false
async function markDone(rssID) {
	/*
  Set the last scraped for the given rssID
  */
	let now = moment().toISOString();
	return await RSS.update(
		{ _id: rssID },
		{
			lastScraped: now,
			isParsing: false,
		}
	);
}
