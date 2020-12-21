import joi from 'joi';
import moment from 'moment';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

import db from '../utils/db';

import RSS from '../models/rss';
import Article from '../models/article';
import logger from '../utils/logger';
import { ParseFeed, checkGuidStability, CreateFingerPrints } from '../parsers/feed';
import {
	ProcessRssQueue,
	ShutDownRssQueue,
	OgQueueAdd,
	StreamQueueAdd,
} from '../asyncTasks';
import { getStatsDClient, timeIt } from '../utils/statsd';
import { getStreamClient } from '../utils/stream';
import { startSampling } from '../utils/watchdog';
import { upsertManyPosts } from '../utils/upsert';
import { ensureEncoded } from '../utils/urls';
import { tryCreateQueueFlag, removeFromQueueFlagSet } from '../utils/queue';
import { isBlockedURLs } from '../utils/blockedURLs';

if (require.main === module) {
	EventEmitter.defaultMaxListeners = 128;

	logger.info('Starting the RSS worker');
	ProcessRssQueue(35, rssProcessor);

	startSampling('winds.event_loop.rss.delay');
}

const streamTTL = 25200; // 7 hours
const duplicateKeyError = 11000;
const secondaryCheckDelay = 240000; // 4 minutes
const statsd = getStatsDClient();

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export async function rssProcessor(job) {
	logger.info(`Processing ${job.data.url}`);

	if (isBlockedURLs(job.data.url)) {
		logger.info(`${job.data.url} is in block list and ignored.`);
		return;
	}

	try {
		await handleRSS(job);
	} catch (err) {
		let tags = { queue: 'rss' };
		let extra = {
			JobRSS: job.data.rss,
			JobURL: job.data.url,
		};

		logger.error('RSS job encountered an error', { err, tags, extra });
		statsd.increment('winds.handle_rss.result.error');
	}

	logger.info(`Completed scraping for ${job.data.url}`);
}

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi
		.string()
		.length(24)
		.regex(/^[0-9a-fA-F]{24}$/),
);
const joiUrl = joi
	.string()
	.uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });

const schema = joi.object().keys({
	rss: joiObjectId.required(),
	url: joiUrl.required(),
});

const chunkSize = 100;

async function updateFeed(rssID, update, articles) {
	for (let offset = 0; offset < articles.length; offset += chunkSize) {
		const limit = offset + chunkSize;
		const chunk = articles.slice(offset, limit);
		const streamArticles = chunk.map((article) => {
			return {
				actor: rssID,
				foreign_id: `articles:${article._id}`,
				object: article._id,
				time: article.publicationDate,
				verb: 'rss_article',
			};
		});
		await timeIt('winds.handle_rss.send_to_collections', () =>
			update(streamArticles),
		);
	}
}

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
		logger.warn(
			`RSS job validation failed: ${validation.error.message} for '${JSON.stringify(
				job.data,
			)}'`,
		);
		statsd.increment('winds.handle_rss.result.validation_failed');
		await RSS.incrScrapeFailures(rssID);
		return;
	}

	const rss = await timeIt('winds.handle_rss.get_rss', () => {
		return RSS.findOne({ _id: rssID });
	});

	if (!rss) {
		logger.warn(`RSS with ID ${rssID} does not exist`);
		statsd.increment('winds.handle_rss.result.model_instance_absent');
		return;
	}

	if (rss.duplicateOf) {
		logger.warn(
			`RSS with ID ${rssID} is a duplicate of ${rss.duplicateOf}. Skipping`,
		);
		statsd.increment('winds.handle_rss.result.model_instance_duplicate');
		return;
	}

	logger.info(`Marked ${rssID} as done`);

	let rssContent, guidStability;
	try {
		rssContent = await ParseFeed(job.data.url, rss.guidStability);
		if (!rss.guidStability || rss.guidStability === 'UNCHECKED') {
			//XXX: waiting a bit to increase the chances of catching time-dependent GUIDs
			await sleep(secondaryCheckDelay);
			const controlRssContent = await ParseFeed(job.data.url, rss.guidStability);
			guidStability = checkGuidStability(
				rssContent.articles,
				controlRssContent.articles,
			);
			rssContent.articles = CreateFingerPrints(rssContent.articles, guidStability);
		}
		await RSS.resetScrapeFailures(rssID);
	} catch (err) {
		await RSS.incrScrapeFailures(rssID);
		logger.warn(`HTTP request failed for url ${job.data.url}: ${err.message}`);
	}

	if (!rssContent || rssContent.articles.length === 0) {
		logger.debug(`RSS with ID ${rssID} is empty`);
		statsd.increment('winds.handle_rss.result.no_content');

		if (rss.guidStability != guidStability) {
			await RSS.update(
				{ _id: rssID },
				{
					guidStability: guidStability || rss.guidStability,
				},
			);
		}
		return;
	}

	if (rssContent.fingerprint && rssContent.fingerprint === rss.fingerprint) {
		logger.debug(`RSS with ID ${rssID} has same fingerprint as registered before`);
		statsd.increment('winds.handle_rss.result.same_content');

		if (rss.guidStability != guidStability) {
			await RSS.update(
				{ _id: rssID },
				{
					guidStability: guidStability || rss.guidStability,
				},
			);
		}
		return;
	}

	logger.debug(`Updating ${rssContent.articles.length} articles for feed ${rssID}`);

	statsd.increment('winds.handle_rss.articles.parsed', rssContent.articles.length);

	for (const article of rssContent.articles) {
		article.rss = rssID;
	}

	logger.debug(`Starting the upsertManyPosts for RSS with ID ${rssID}`);
	const operationMap = await upsertManyPosts(rssID, rssContent.articles, 'rss');
	const updatedArticles = operationMap.new
		.concat(operationMap.changed)
		.filter((a) => !!a.url);
	logger.info(
		`Finished updating. ${updatedArticles.length} out of ${rssContent.articles.length} changed for RSS with ID ${rssID}`,
	);

	await RSS.update(
		{ _id: rssID },
		{
			postCount: await Article.count({ rss: rssID }),
			fingerprint: rssContent.fingerprint,
			guidStability: guidStability || rss.guidStability,
		},
	);

	statsd.increment('winds.handle_rss.articles.upserted', updatedArticles.length);

	if (!updatedArticles.length) {
		statsd.increment('winds.handle_rss.result.no_updates');
		return;
	}

	const streamClient = getStreamClient();
	const rssFeed = streamClient.feed('rss', rssID);
	if (operationMap.new.length) {
		await updateFeed(
			rssID,
			rssFeed.addActivities.bind(rssFeed),
			operationMap.new.filter((a) => !!a.url),
		);
	}
	if (operationMap.changed.length) {
		await updateFeed(
			rssID,
			streamClient.updateActivities.bind(streamClient),
			operationMap.changed.filter((a) => !!a.url),
		);
	}

	const queueOpts = { removeOnComplete: true, removeOnFail: true };
	const tasks = [];

	if (await tryCreateQueueFlag('og', 'rss', rssID)) {
		tasks.push(
			OgQueueAdd(
				{ type: 'article', rss: rssID, urls: updatedArticles.map((a) => a.url) },
				queueOpts,
			),
		);
	}
	const allowedLanguage = [null, undefined, '', 'eng'].includes(rss.language);
	if (allowedLanguage) {
		tasks.push(
			StreamQueueAdd(
				{ rss: rssID, contentIds: updatedArticles.map((a) => a._id) },
				queueOpts,
			),
		);
	}
	statsd.increment('winds.handle_rss.result.updates');
}

async function markDone(rssID) {
	await removeFromQueueFlagSet('rss', 'rss', rssID);
	return await RSS.update({ _id: rssID }, { lastScraped: moment().toISOString() });
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

async function failure(source, err) {
	logger.error(`Unhandled ${source}: ${err.stack}. Shutting down RSS worker.`);
	try {
		await ShutDownRssQueue();
		mongoose.connection.close();
		statsd.increment('winds.handle_rss.result.error');
	} catch (err) {
		logger.error(`Failure during RSS worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));
