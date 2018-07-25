import joi from 'joi';
import axios from 'axios';
import normalize from 'normalize-url';

import db from '../utils/db';
import logger from '../utils/logger';
import RSS from '../models/rss'; // eslint-disable-line
import Podcast from '../models/podcast'; // eslint-disable-line
import Article from '../models/article';
import Episode from '../models/episode';
import { ParseOG, IsValidOGUrl } from '../parsers/og';
import { ProcessOgQueue } from '../asyncTasks';
import { setupAxiosRedirectInterceptor } from '../utils/axios';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);
}

logger.info('Starting the OG worker');
const schemaMap = { episode: Episode, article: Article, rss: RSS, podcast: Podcast };

ProcessOgQueue(50, ogProcessor);
logger.info(`Starting to process the og queue...`);

export async function ogProcessor(job) {
	logger.info(`OG image scraping: ${job.data.url}`);

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

const validTypes = ['episode', 'article', 'rss', 'podcast'];

const joiUrl = joi.string().uri({ scheme: ['http', 'https'] });
const schema = joi.object().keys({
	update: joi.boolean().default(false),
	type: joi.string().valid(validTypes).required(),
	url: joiUrl,
	urls: joi.array().min(1),
}).xor('url', 'urls');

// Run the OG scraping job
export async function handleOg(job) {
	joi.assert(job.data, schema);

	const update = job.data.update;
	const jobType = job.data.type;

	const urls = job.data.urls || [job.data.url];
	for (const url of urls) {
		if (!!joi.validate(url, joiUrl).error) {
			logger.error(`invalid URL '${url}' for jobtype ${jobType}`);
			continue;
		}

		// Lookup the right type of schema: article, episode or podcast
		const mongoSchema = schemaMap[jobType];
		const field = jobType === 'episode' ? 'link' : 'url';

		// if the instance hasn't been created yet, or it already has an OG image, ignore
		const instances = await mongoSchema.find({ [field]: url }).lean().limit(10);
		if (!instances.length) {
			logger.warn(`instance not found for type ${jobType} with lookup ${field}: '${url}'`);
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

		if (!(await IsValidOGUrl(url))) {
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
