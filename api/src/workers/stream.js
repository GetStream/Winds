import joi from 'joi';
import mongoose from 'mongoose';

import db from '../utils/db';

import RSS from '../models/rss';
import Podcast from '../models/podcast';
import logger from '../utils/logger';
import { ProcessStreamQueue, ShutDownStreamQueue } from '../asyncTasks';
import { timeIt } from '../utils/statsd';
import { sendFeedToCollections } from '../utils/collections';
import { removeQueueFlag } from '../utils/queue';
import { startSampling } from '../utils/watchdog';

if (require.main === module) {
	logger.info('Starting the Stream worker');
	ProcessStreamQueue(2, streamProcessor);

	startSampling('winds.event_loop.stream.delay');
}

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
		logger.warn(`Stream job validation failed: ${validation.error.message} for '${JSON.stringify(job.data)}'`);
		return;
	}

	const type = 'rss' in job.data ? 'rss' : 'podcast';
	const model = 'rss' in job.data ? RSS : Podcast;

	await removeQueueFlag('stream', type, job.data[type]);

	const feed = await model.findById(job.data[type]);
	await timeIt('winds.handle_stream.send_to_collections', () => sendFeedToCollections(type, feed));
}

async function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		await ShutDownStreamQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during Stream worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

async function failure(reason, err) {
	logger.error(`Unhandled ${reason}: ${err.stack}. Shutting down Stream worker.`);
	try {
		await ShutDownStreamQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during Stream worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));
