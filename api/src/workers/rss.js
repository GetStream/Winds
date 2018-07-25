import joi from 'joi';
import axios from 'axios';
import moment from 'moment';

import db from '../utils/db';

import RSS from '../models/rss';
import Article from '../models/article';
import logger from '../utils/logger';
import { ParseFeed } from '../parsers/feed';
import { ProcessRssQueue, OgQueueAdd, StreamQueueAdd, SocialQueueAdd } from '../asyncTasks';
import { getStatsDClient, timeIt } from '../utils/statsd';
import { upsertManyPosts } from '../utils/upsert';
import { setupAxiosRedirectInterceptor } from '../utils/axios';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);
}

const duplicateKeyError = 11000;

logger.info('Starting the RSS worker');

ProcessRssQueue(100, rssProcessor);

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
const joiUrl = joi.string().uri({ scheme: ['http', 'https'] });

const schema = joi.object().keys({
	rss: joiObjectId.required(),
	url: joiUrl.required(),
});

export async function handleRSS(job) {
	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(validation.error);
		return;
	}

	const rssID = job.data.rss;

	await timeIt('winds.handle_rss.ack', () => {
		return markDone(rssID);
	});

	const rss = await timeIt('winds.handle_rss.get_rss', () => {
		return RSS.findOne({ _id: rssID });
	});

	if (!rss) {
		logger.warn(`RSS with ID ${rssID} does not exist`);
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
		logger.warn(`http request failed for url ${job.data.url}: ${err.message}`);
	}

	if (!rssContent) {
		return;
	}

	logger.debug(`Updating ${rssContent.articles.length} articles for feed ${rssID}`);
	if (rssContent.articles.length === 0) {
		return;
	}

	statsd.increment('winds.handle_rss.articles.parsed', rssContent.articles.length);
	statsd.timing('winds.handle_rss.articles.parsed', rssContent.articles.length);

	for (const article of rssContent.articles) {
		article.rss = rssID;
	}

	logger.debug(`starting the upsertManyPosts for ${rssID}`);
	const operationMap = await upsertManyPosts(rssID, rssContent.articles, 'rss');
	const updatedArticles = operationMap.new.concat(operationMap.changed).filter(a => !!a.url);
	logger.info(`Finished updating. ${updatedArticles.length} out of ${rssContent.articles.length} changed`);

	await RSS.update({ _id: rssID }, {
		postCount: await Article.count({ rss: rssID }),
		fingerprint: rssContent.fingerprint,
	});

	statsd.increment('winds.handle_rss.articles.upserted', updatedArticles.length);
	const queueOpts = { removeOnComplete: true, removeOnFail: true };

	if (!updatedArticles.length) {
		return;
	}

	await Promise.all([
		await OgQueueAdd({
			type: 'article',
			urls: updatedArticles.map(a => a.url),
		}, queueOpts),
		await SocialQueueAdd({
			rss: rssID,
			articles: updatedArticles.map(a => ({
				id: a._id,
				link: a.link,
				commentUrl: a.commentUrl,
			})),
		}, queueOpts),
		await StreamQueueAdd({
			rss: rssID,
			articles: updatedArticles.map(a => ({
				id: a._id,
				publicationDate: a.publicationDate,
			})),
		}, queueOpts),
	]);
}

async function markDone(rssID) {
	return await RSS.update(
		{ _id: rssID },
		{ lastScraped: moment().toISOString(), isParsing: false },
	);
}
