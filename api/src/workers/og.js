import joi from 'joi';
import mongoose from 'mongoose';
import normalize from 'normalize-url';
import { EventEmitter } from 'events';

import db from '../utils/db';
import logger from '../utils/logger';
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
}

export async function ogProcessor(job) {
	logger.info(`OG image scraping: ${job.data.url || job.data.urls}`);

	try {
		await handleOg(job);
	} catch (err) {
		const tags = { queue: 'og' };
		const extra = {
			JobURL: job.data.url || job.data.urls ,
			JobType: job.data.type,
		};
		logger.error('OG job encountered an error', { err, tags, extra });
	}
}

const schemaMap = { episode: Episode, article: Article, rss: RSS, podcast: Podcast };
const parentSchemaMap = { episode: Podcast, article: RSS, rss: RSS, podcast: Podcast };
const validTypes = ['episode', 'article', 'rss', 'podcast'];

const joiUrl = joi.string().uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });
const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/)
);
const schema = joi.object().keys({
	update: joi.boolean().default(false),
	rss: joiObjectId,
	podcast: joiObjectId,
	type: joi.string().valid(validTypes).required(),
	url: joiUrl,
	urls: joi.array().min(1),
}).xor('url', 'urls').xor('rss', 'podcast');

// Run the OG scraping job
export async function handleOg(job) {
	const originalPayload = Object.assign({}, job.data);
	try {
		// best effort at escaping urls found in the wild
		if (!!job.data.urls) {
			job.data.urls = job.data.urls.map(u => ensureEncoded(u));
		} else {
			job.data.url = ensureEncoded(job.data.url);
		}
	} catch (_) {
		//XXX: ignore error
	}
	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(`OG job validation failed: ${validation.error.message} for '${JSON.stringify(job.data)}'`);
		return;
	}

	const update = job.data.update;
	const jobType = job.data.type;
	const mongoSchema = schemaMap[jobType];
	const mongoParentSchema = parentSchemaMap[jobType];
	const field = jobType === 'episode' ? 'link' : 'url';
	const parentField = mongoParentSchema === RSS ? 'rss' : 'podcast';

	await mongoParentSchema.update({ _id: job.data[parentField] }, { "queueState.isUpdatingOG": false });

	const urls = job.data.urls || [job.data.url];
	const unecapedUrls = originalPayload.urls || [originalPayload.url];
	for (let i in urls) {
		const url = urls[i];
		const originalUrl = unecapedUrls[i];
		if (!!joi.validate(url, joiUrl).error) {
			logger.warn(`OG job validation failed: invalid URL '${url}' for jobtype ${jobType}`);
			continue;
		}

		// if the instance hasn't been created yet, or it already has an OG image, ignore
		const instances = await mongoSchema.find({ [field]: originalUrl }).lean().limit(10);
		if (!instances.length) {
			logger.warn(`instance not found for type ${jobType} with lookup ${field}: '${originalUrl}' (${url})`);
			continue;
		}

		logger.debug(`found ${instances.length} to update with url ${url}`);

		const needUpdate = instances.filter(i => !i.images.og);
		if (!needUpdate.length && !update) {
			for (const instance of instances.filter(i => !!i.images.og)) {
				logger.debug(`instance already has an image '${instance.images.og}': ${jobType} with lookup ${field}: '${url}'`);
			}
			continue;
		}

		if (!(IsValidOGUrl(url))) {
			continue;
		}

		let ogImage;
		try {
			ogImage = await ParseOG(url);
			if (!ogImage) {
				logger.debug(`Didn't find image for ${url}`);
				continue;
			}
		} catch (err) {
			//XXX: err object is huge, dont log it
			const message = err.message.length > 256 ? err.message.substr(0, 253) + '...' : err.message;
			logger.debug(`OGS scraping broke for URL '${url}': ${message}`);
			continue;
		}
		let normalized;
		try {
			normalized = normalize(ogImage);
		} catch (err) {
			logger.debug(`Bad OG Image URL '${ogImage}'`, { err });
			continue;
		}

		for (const instance of needUpdate) {
			const images = Object.assign(instance.images || {}, { og: normalized });
			await mongoSchema.update({ _id: instance._id }, { images });
		}
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

async function failure(err) {
	logger.error(`Unhandled error: ${err.stack}. Shutting down OG worker.`);
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
process.on('unhandledRejection', failure);
process.on('uncaughtException', failure);
