import axios from 'axios';
import mongoose from 'mongoose';
import joi from 'joi';

import db from '../utils/db';

import RSS from '../models/rss';
import Article from '../models/article';
import logger from '../utils/logger';
import { ProcessSocialQueue } from '../asyncTasks';
import { timeIt } from '../utils/statsd';
import { fetchSocialScore } from '../utils/social';
import { setupAxiosRedirectInterceptor } from '../utils/axios';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);
}

// connect the handler to the queue
logger.info('Starting the Social worker');

ProcessSocialQueue(100, socialProcessor);

const streamQueueSettings = { removeOnComplete: true, removeOnFail: true };

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/)
);
const joiUrl = joi.string().uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });

const schema = joi.object().keys({
	rss: joiObjectId.required(),
	articles: joi.array().min(1).required(),
});
const itemSchema = joi.object().keys({
	id: joiObjectId.required(),
	link: joiUrl,
	commentUrl: joi.any(),
});

export async function socialProcessor(job) {
	logger.info(`Processing social scores for feed ${job.data.rss}`);
	// just intercept error handling before it goes to Bull
	try {
		await handleSocial(job);
	} catch (err) {
		const tags = { queue: 'social' };
		const extra = { JobRSS: job.data.rss, JobArticles: job.data.articles };
		logger.error('Social job encountered an error', { err, tags, extra });
	}
	logger.info(`Completed processing social scores for feed ${job.data.rss}`);
}

export async function handleSocial(job) {
	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(validation.error);
		return;
	}

	const socialBatch = Article.collection.initializeUnorderedBulkOp();
	const articles = job.data.articles.filter(a => !joi.validate(a, itemSchema).error);
	if (!articles.length) {
		throw new Error(`No article passed validation: ${articles.map(a => joi.validate(a, itemSchema).error)}`);
	}
	let updatingSocialScore = false;
	await timeIt('winds.handle_social.update_social_score', () => {
		return Promise.all(articles.map(async article => {
			const socialScore = await fetchSocialScore(article);
			if (Object.keys(socialScore).length) {
				updatingSocialScore = true;
				socialBatch.find({ _id: mongoose.Types.ObjectId(article.id) }).updateOne({ $set: { socialScore } });
			}
		}));
	});
	if (updatingSocialScore) {
		await socialBatch.execute();
	}
}
