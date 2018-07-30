import axios from 'axios';
import joi from 'joi';

import db from '../utils/db';

import RSS from '../models/rss';
import Podcast from '../models/podcast';
import logger from '../utils/logger';
import { ProcessStreamQueue } from '../asyncTasks';
import { timeIt } from '../utils/statsd';
import { sendFeedToCollections } from '../utils/collections';
import { setupAxiosRedirectInterceptor } from '../utils/axios';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);
}

// connect the handler to the queue
logger.info('Starting the Stream worker');

ProcessStreamQueue(1, streamProcessor);

export async function streamProcessor(job) {
	logger.info(`Processing Stream feeds for feed ${job.data.rss}`);
	// just intercept error handling before it goes to Bull
	try {
		await handleStream(job);
	} catch (err) {
		const tags = { queue: 'stream' };
		const extra = { JobRSS: job.data.rss, JobArticles: job.data.articles };
		logger.error('Stream feed job ecountered an error', { err, tags, extra });
	}
	logger.info(`Completed processing Stream feeds for feed ${job.data.rss}`);
}

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/)
);

const schema = joi.object().keys({
	rss: joiObjectId,
	podcast: joiObjectId,
}).xor('rss', 'podcast');

export async function handleStream(job) {
	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(`Stream job validation failed: ${validation.error.message}`);
		return;
	}

	const type = 'rss' in job.data ? 'rss' : 'podcast';
	const model = 'rss' in job.data ? RSS : Podcast;

	const feed = await model.findById(job.data[type]);
	await timeIt('winds.handle_stream.send_to_collections', () => sendFeedToCollections(type, feed));
}
