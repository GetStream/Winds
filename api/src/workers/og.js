import '../loadenv';
import '../utils/db';

import normalize from 'normalize-url';

// rss import model is needed because Article refs it
import RSS from '../models/rss'; // eslint-disable-line
import Podcast from '../models/podcast'; // eslint-disable-line
import Article from '../models/article';
import Episode from '../models/episode';
import logger from '../utils/logger';
import { ParseOG, IsValidOGUrl } from '../parsers/og';
import { ProcessOgQueue } from '../asyncTasks';

// TODO: move this to a different main.js
logger.info('Starting the OG worker');
const schemaMap = { episode: Episode, article: Article, rss: RSS, podcast: Podcast };

const concurrency = 50;

ProcessOgQueue(concurrency, ogProcessor);

logger.info(`Start the og queue, concurrency ${concurrency}`);

export async function ogProcessor(job) {
	logger.info(`OG image scraping: ${job.data.url}`);
	try {
		await handleOg(job);
	} catch (err) {
		let tags = { queue: 'og' };
		let extra = {
			JobURL: job.data.url,
			JobType: job.data.type,
		};
		logger.error('OG job encountered an error', { err, tags, extra });
	}
}

// Run the OG scraping job
export async function handleOg(job) {
	const url = job.data.url;
	const jobType = job.data.type;
	const update = job.data.update;

	if (!['episode', 'article', 'rss', 'podcast'].includes(jobType)) {
		return logger.error(`couldnt find schema for jobtype ${jobType}`);
	}

	if (!url) {
		return logger.error(`URL is missing for jobtype ${jobType}`);
	}

	// Lookup the right type of schema: article, episode or podcast
	const mongoSchema = schemaMap[jobType];
	const field = jobType === 'episode' ? 'link' : 'url';

	// if the instance hasn't been created yet, or it already has an OG image, ignore
	let lookup = {};
	lookup[field] = url;
	const instances = await mongoSchema
		.find(lookup)
		.lean()
		.limit(10);
	if (!instances.length) {
		return logger.warn(
			`instance not found for type ${jobType} with lookup ${field}: ${url}`,
		);
	} else {
		logger.debug(`found ${instances.length} to update with url ${url}`);
	}

	const needUpdate = instances.filter(i => !i.images.og);
	if (!needUpdate.length && !update) {
		for (const instance of instances.filter(i => !!i.images.og)) {
			logger.debug(
				`instance already has an image ${
					instance.images.og
				}: ${jobType} with lookup ${field}: ${url}`,
			);
		}
		return;
	}

	if (!(await IsValidOGUrl(url))) {
		return;
	}

	let ogImage;
	try {
		ogImage = await ParseOG(url);
		if (!ogImage) {
			return logger.debug(`Didn't find image for ${url}`);
		}
	} catch (err) {
		// err object is huge, dont log it
		return logger.debug(`OGS scraping broke for URL ${url}`);
	}

	let normalized;
	try {
		normalized = normalize(ogImage);
	} catch (err) {
		return logger.debug(`Bad OG Image URL ${ogImage}`, { err });
	}

	for (const instance of needUpdate) {
		const images = instance.images || {};
		images.og = normalized;
		await mongoSchema.update({ _id: instance._id }, { images });
	}

	logger.info(`Stored ${normalized} image for ${url}`);
}
