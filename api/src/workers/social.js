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
import { ensureEncoded } from '../utils/urls';

if (require.main === module) {
	setupAxiosRedirectInterceptor(axios);

	logger.info('Starting the Social worker');
	ProcessSocialQueue(35, socialProcessor);
}

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
	try {
		// best effort at escaping urls found in the wild
		for (const article of job.data.articles) {
			article.link = ensureEncoded(article.link);
		}
	} catch (_) {
		//XXX: ignore error
	}

	const validation = joi.validate(job.data, schema);
	if (!!validation.error) {
		logger.warn(`Social job validation failed: ${validation.error.message} for '${JSON.stringify(job.data)}'`);
		return;
	}

	const socialBatch = Article.collection.initializeUnorderedBulkOp();
	const articles = job.data.articles.filter(a => !joi.validate(a, itemSchema).error);
	if (!articles.length) {
		const errors = job.data.articles.map(a => joi.validate(a, itemSchema)).filter(r => !!r.error);
		logger.warn(`No article passed validation: ${errors.map(r => r.error.message)} for '${JSON.stringify(job.data)}'`);
		return;
	}

	await RSS.update({ _id: job.data.rss }, { "queueState.isSynchronizingWithStream": false });

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
