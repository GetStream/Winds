import '../loadenv';

import stream from 'getstream';
import moment from 'moment';
import normalize from 'normalize-url';

import RSS from '../models/rss';
import Article from '../models/article';

import '../utils/db';
import config from '../config';
import logger from '../utils/logger';

import { sendRssFeedToCollections } from '../utils/collections';
import { ParseFeed } from '../parsers/feed';

import { ProcessRssQueue, OgQueueAdd } from '../asyncTasks';
import { getStatsDClient, timeIt } from '../utils/statsd';
import { upsertManyPosts } from '../utils/upsert';
import { getStreamClient } from '../utils/stream';

const duplicateKeyError = 11000;

// connect the handler to the queue
logger.info('Starting the RSS worker');

//TODO: move this to a separate main.js
ProcessRssQueue(100, rssProcessor);

const statsd = getStatsDClient();

export async function rssProcessor(job) {
	logger.info(`Processing ${job.data.url}`);
	// just intercept error handling before it goes to Bull
	try {
		await handleRSS(job);
	} catch (err) {
		let tags = { queue: 'rss' };
		let extra = {
			JobRSS: job.data.rss,
			JobURL: job.data.url,
		};
		logger.error('RSS job encountered an error', { err, tags, extra });
	}
	logger.info(`Completed scraping for ${job.data.url}`);
}

// Handle Podcast scrapes the podcast and updates the episodes
export async function handleRSS(job) {
    logger.warn('test-test-test');
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

	if (rss.duplicateOf) {
		logger.warn(`RSS with ID ${rssID} is a duplicate of ${rss.duplicateOf}. Skipping`);
		return;
	}

	logger.info(`Marked ${rssID} as done`);

	// parse the articles
	let rssContent;
	try {
		rssContent = await ParseFeed(job.data.url);
		await RSS.resetScrapeFailures(rssID);
	} catch (err) {
        console.log(err);
		await RSS.incrScrapeFailures(rssID);
		throw new Error(`http request failed for url ${job.data.url}`);
	}

	if (!rssContent) {
		return;
	}

	// update the articles
	logger.debug(`Updating ${rssContent.articles.length} articles for feed ${rssID}`);

	if (rssContent.articles.length === 0) {
		return;
	}

	statsd.increment('winds.handle_rss.articles.parsed', rssContent.articles.length);
	statsd.timing('winds.handle_rss.articles.parsed', rssContent.articles.length);

	let articles = rssContent.articles;
	for (let a of articles) {
		a.rss = rssID;
	}
	logger.debug(`starting the upsertManyPosts for ${rssID}`);
	let operationMap = await upsertManyPosts(rssID, articles, 'rss');
	let updatedArticles = operationMap.new.concat(operationMap.changed);
	logger.info(
		`Finished updating. ${updatedArticles.length} out of ${articles.length} changed`,
	);

	// update the count
	await RSS.update(
		{ _id: rssID },
		{
			postCount: await Article.count({ rss: rssID }),
			fingerprint: rssContent.fingerprint,
		},
	);

	statsd.increment('winds.handle_rss.articles.upserted', updatedArticles.length);

	await timeIt('winds.handle_rss.OgQueueAdd', () => {
		return Promise.all(
			updatedArticles.filter(a => !!a.url).map(article => {
				OgQueueAdd(
					{
						type: 'article',
						url: article.url,
					},
					{
						removeOnComplete: true,
						removeOnFail: true,
					},
				);
			}),
		);
	});

	let t0 = new Date();
	let rssFeed = getStreamClient().feed('rss', rssID);
	logger.debug(`Syncing ${updatedArticles.length} articles to Stream`);
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

// markDone sets lastScraped to now and isParsing to false
async function markDone(rssID) {
	const now = moment().toISOString();
	return await RSS.update({ _id: rssID }, { lastScraped: now, isParsing: false });
}
