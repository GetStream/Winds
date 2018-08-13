import joi from 'joi';
import axios from 'axios';
import moment from 'moment';
import mongoose from 'mongoose';

import db from '../utils/db';

import RSS from '../models/rss';
import Article from '../models/article';
import logger from '../utils/logger';
import { ParseFeed } from '../parsers/feed';
import { ProcessRssQueue, ShutDownRssQueue, OgQueueAdd, StreamQueueAdd, SocialQueueAdd } from '../asyncTasks';
import { getStatsDClient, timeIt } from '../utils/statsd';
import { getStreamClient } from '../utils/stream';
import { upsertManyPosts } from '../utils/upsert';
import { setupAxiosRedirectInterceptor } from '../utils/axios';
import { ensureEncoded } from '../utils/urls';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);

	logger.info('Starting the RSS worker');
	ProcessRssQueue(35, rssProcessor);
}

const duplicateKeyError = 11000;
const statsd = getStatsDClient();

export async function rssProcessor(job) {
	logger.info(`Processing ${job.data.url}`);
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

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/)
);
const joiUrl = joi.string().uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });

const schema = joi.object().keys({
	rss: joiObjectId.required(),
	url: joiUrl.required(),
});

export async function handleRSS(job) {
	try {
		// best effort at escaping urls found in the wild
		job.data.url = ensureEncoded(job.data.url);
	} catch (_) {
		//XXX: ignore error
	}

	const rssID = job.data.rss;

	await timeIt('winds.handle_rss.ack', () => {
		return markDone(rssID);
	});

	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(`RSS job validation failed: ${validation.error.message} for '${JSON.stringify(job.data)}'`);
		await RSS.incrScrapeFailures(rssID);
		return;
	}

	const rss = await timeIt('winds.handle_rss.get_rss', () => {
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
		await RSS.incrScrapeFailures(rssID);
		logger.warn(`HTTP request failed for url ${job.data.url}: ${err.message}`);
	}

	if (!rssContent || rssContent.articles.length === 0) {
	    logger.debug(`RSS with ID ${rssID} is empty`);
		return;
	}

	if (rssContent.fingerprint && rssContent.fingerprint === rss.fingerprint) {
	    logger.debug(`RSS with ID ${rssID} has same fingerprint as registered before`);
		return;
	}

	logger.debug(`Updating ${rssContent.articles.length} articles for feed ${rssID}`);

	statsd.increment('winds.handle_rss.articles.parsed', rssContent.articles.length);
	statsd.timing('winds.handle_rss.articles.parsed', rssContent.articles.length);

	for (const article of rssContent.articles) {
		article.rss = rssID;
	}

	logger.debug(`Starting the upsertManyPosts for RSS with ID ${rssID}`);
	const operationMap = await upsertManyPosts(rssID, rssContent.articles, 'rss');
	const updatedArticles = operationMap.new.concat(operationMap.changed).filter(a => !!a.url);
	logger.info(`Finished updating. ${updatedArticles.length} out of ${rssContent.articles.length} changed for RSS with ID ${rssID}`);

	await RSS.update({ _id: rssID }, {
		postCount: await Article.count({ rss: rssID }),
		fingerprint: rssContent.fingerprint,
	});

	statsd.increment('winds.handle_rss.articles.upserted', updatedArticles.length);

	if (!updatedArticles.length) {
		return;
	}

	const rssFeed = getStreamClient().feed('rss', rssID);
	const chunkSize = 100;
	for (let offset = 0; offset < updatedArticles.length; offset += chunkSize) {
		const limit = offset + chunkSize;
		const chunk = updatedArticles.slice(offset, limit);
		const streamArticles = chunk.map(article => {
			return {
				actor: rssID,
				foreign_id: `articles:${article._id}`,
				object: article._id,
				time: article.publicationDate,
				verb: 'rss_article',
			};
		});
		await timeIt('winds.handle_rss.send_to_collections', () => rssFeed.addActivities(streamArticles));
	}

	const queueOpts = { removeOnComplete: true, removeOnFail: true };
	const tasks = [];
	const queueState = {};
	if (!rss.queueState.isFetchingSocialScore) {
		queueState["queueState.isFetchingSocialScore"] = true;
		tasks.push(SocialQueueAdd({
			rss: rssID,
			articles: updatedArticles.map(a => ({
				id: a._id,
				link: a.link,
				commentUrl: a.commentUrl,
			})),
		}, queueOpts));
	}
	if (!rss.queueState.isUpdatingOG) {
		queueState["queueState.isUpdatingOG"] = true;
		tasks.push(OgQueueAdd({ type: 'article', rss: rssID, urls: updatedArticles.map(a => a.url) }, queueOpts));
	}
	if (!rss.queueState.isSynchronizingWithStream) {
		queueState["queueState.isSynchronizingWithStream"] = true;
		tasks.push(StreamQueueAdd({ rss: rssID }, queueOpts));
	}
	await Promise.all([await RSS.update({ _id: rssID }, queueState), ...tasks]);
}

async function markDone(rssID) {
	return await RSS.update({ _id: rssID }, { lastScraped: moment().toISOString(), "queueState.isParsing": false });
}

async function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		await ShutDownRssQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during RSS worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
