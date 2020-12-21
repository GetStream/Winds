import joi from 'joi';
import mongoose from 'mongoose';
import normalize from 'normalize-url';
import { EventEmitter } from 'events';

import db from '../utils/db';
import logger from '../utils/logger';
import { startSampling } from '../utils/watchdog';
import { removeQueueFlag } from '../utils/queue';
import { isBlockedURLs } from '../utils/blockedURLs';
import RSS from '../models/rss'; // eslint-disable-line
import Podcast from '../models/podcast'; // eslint-disable-line
import Article from '../models/article';
import Episode from '../models/episode';
import { ParseOG, IsValidOGUrl } from '../parsers/og';
import { ProcessOgQueue, ShutDownOgQueue } from '../asyncTasks';

if (require.main === module) {
	EventEmitter.defaultMaxListeners = 128;

	logger.info('Starting the OG worker');
	ProcessOgQueue(35, ogProcessor);

	startSampling('winds.event_loop.og.delay');
}

export async function ogProcessor(job) {
	const JobURL = job.data.url || job.data.urls;
	logger.info(`OG image scraping: ${JobURL}`);

	if (isBlockedURLs(JobURL)) {
		logger.info(`${JobURL} is in block list and ignored.`);
		return;
	}

	try {
		await handleOg(job);
	} catch (err) {
		const tags = { queue: 'og' };
		const extra = {
			JobURL,
			JobType: job.data.type,
		};
		logger.error('OG job encountered an error', { err, tags, extra });
	}
}

const schemaMap = { episode: Episode, article: Article, rss: RSS, podcast: Podcast };
const parentSchemaMap = { episode: Podcast, article: RSS, rss: RSS, podcast: Podcast };
const validTypes = ['episode', 'article', 'rss', 'podcast'];

const joiUrl = joi
	.string()
	.uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });
const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi
		.string()
		.length(24)
		.regex(/^[0-9a-fA-F]{24}$/),
);
const schema = joi
	.object()
	.keys({
		update: joi.boolean().default(false),
		rss: joiObjectId,
		podcast: joiObjectId,
		type: joi.string().valid(validTypes).required(),
		url: joiUrl,
		urls: joi.array().min(1),
	})
	.xor('url', 'urls')
	.xor('rss', 'podcast');

// Run the OG scraping job
export async function handleOg(job) {
	const originalPayload = {};
	try {
		// best effort at escaping urls found in the wild
		if (!!job.data.urls) {
			originalPayload.urls = job.data.urls;
			job.data.urls = job.data.urls.map((u) => ensureEncoded(u));
		} else {
			originalPayload.url = job.data.url;
			job.data.url = ensureEncoded(job.data.url);
		}
	} catch (_) {
		//XXX: ignore error
	}
	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(
			`OG job validation failed: ${validation.error.message} for '${JSON.stringify(
				job.data,
			)}'`,
		);
		return;
	}

	const update = job.data.update;
	const jobType = job.data.type;
	const mongoSchema = schemaMap[jobType];
	const mongoParentSchema = parentSchemaMap[jobType];
	const field = jobType === 'episode' ? 'link' : 'url';
	const parentField = mongoParentSchema === RSS ? 'rss' : 'podcast';

	await removeQueueFlag('og', parentField, job.data[parentField]);

	const urls = job.data.urls || [job.data.url];
	const unecapedUrls = originalPayload.urls || [originalPayload.url];
	for (let i in urls) {
		const url = urls[i];
		const originalUrl = unecapedUrls[i];
		if (!!joi.validate(url, joiUrl).error) {
			logger.warn(
				`OG job validation failed: invalid URL '${url}' for jobtype ${jobType}`,
			);
			continue;
		}

		// if the instance hasn't been created yet, or it already has an OG image, ignore
		const instances = await mongoSchema
			.find({ [field]: originalUrl })
			.lean()
			.limit(10);
		if (!instances.length) {
			logger.warn(
				`instance not found for type ${jobType} with lookup ${field}: '${originalUrl}' (${url})`,
			);
			continue;
		}

		logger.debug(`found ${instances.length} to update with url ${url}`);

		const needUpdate = instances.filter((i) => !i.images.og || !i.canonicalUrl);
		if (!needUpdate.length && !update) {
			for (const instance of instances.filter((i) => !!i.images.og)) {
				logger.debug(
					`instance already has an image '${instance.images.og}': ${jobType} with lookup ${field}: '${url}'`,
				);
			}
			for (const instance of instances.filter((i) => !!i.canonicalUrl)) {
				logger.debug(
					`instance already has a canonical URL '${instance.canonicalUrl}': ${jobType} with lookup ${field}: '${url}'`,
				);
			}
			continue;
		}

		if (!IsValidOGUrl(url)) {
			continue;
		}

		let og;
		try {
			og = await ParseOG(url);
			if (!og.image) {
				logger.debug(`Didn't find image for ${url}`);
			}
			if (!og.canonicalUrl) {
				logger.debug(`Didn't find canonicalUrl for ${url}`);
			}
			if (!og.image && !og.canonicalUrl) {
				continue;
			}
		} catch (err) {
			//XXX: err object is huge, dont log it
			const message =
				err.message.length > 256
					? err.message.substr(0, 253) + '...'
					: err.message;
			logger.debug(`OGS scraping broke for URL '${url}': ${message}`);
			continue;
		}
		let normalized;
		try {
			normalized = normalize(og.image);
		} catch (err) {
			logger.debug(`Bad OG Image URL '${og.image}'`, { err });
		}

		if (!normalized && !og.canonicalUrl) {
			continue;
		}
		const operations = [];
		for (const instance of needUpdate) {
			const updates = {};
			if (normalized) {
				updates.images = Object.assign(instance.images || {}, { og: normalized });
			}
			if (og.canonicalUrl) {
				updates.canonicalUrl = og.canonicalUrl;
			}
			operations.push({
				updateOne: { filter: { _id: instance._id }, update: { $set: updates } },
			});
		}
		await mongoSchema.bulkWrite(operations, { ordered: false });
		logger.info(`Stored ${normalized} image for '${url}'`);
	}
}

async function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		await ShutDownOgQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during OG worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

async function failure(reason, err) {
	logger.error(`Unhandled ${reason}: ${err.stack}. Shutting down OG worker.`);
	try {
		await ShutDownOgQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during OG worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));
