import Article from '../models/article';
import Episode from '../models/episode';
import RSS from '../models/rss';
import Podcast from '../models/podcast';
import moment from 'moment';
import config from '../config';

import { version } from '../../../app/package.json';
import { Throw } from '../utils/errors';
import Queue from 'bull';
import logger from '../utils/logger';

const rssQueue = new Queue('rss', config.cache.uri);
const ogQueue = new Queue('og', config.cache.uri);
const podcastQueue = new Queue('podcast', config.cache.uri);

const tooOld = 3 * 60 * 60 * 1000;

const queues = {
	'RSS Queue': rssQueue,
	'OG Queue': ogQueue,
	'Podcast Queue': podcastQueue,
};

exports.health = async (req, res) => {
	res.status(200).send({ version, healthy: '100%' });
};

exports.status = async (req, res) => {
	let output = { version, code: 200 };

	const latestArticle = await Article.find({}).sort({ _id: -1 });
	const latestEpisode = await Episode.find({}).sort({ _id: -1 });

	let now = new Date();

	output.now = now;
	output.mostRecentArticle = moment(latestArticle.createdAt).fromNow();
	output.mostRecentEpisode = moment(latestEpisode.createdAt).fromNow();

	if (
		now - latestArticle.createdAt > tooOld ||
		now - latestEpisode.createdAt > tooOld
	) {
		output.code = 500;
		output.error =
			now - latestArticle.createdAt > tooOld
				? 'The most recent article is too old.'
				: 'The most recent episode is too old.';
	}

	output.rssCurrentlyParsing = await RSS.count({ isParsing: true });
	output.podcastCurrentlyParsing = await Podcast.count({ isParsing: true });

	if (output.rssCurrentlyParsing > 1000) {
		output.code = 500;
		output.error = `There are too many RSS feeds currently parsing ${
			output.rssCurrentlyParsing
		}`;
	}

	if (output.podcastCurrentlyParsing > 500) {
		output.code = 500;
		output.error = `There are too many Podcast feeds currently parsing ${
			output.podcastCurrentlyParsing
		}`;
	}

	res.status(output.code).send(output);
};

exports.queue = async (req, res) => {
	let output = { version, code: 200 };

	for (const [key, queue] of Object.entries(queues)) {
		let queueStatus = await queue.getJobCounts();
		output[key] = queueStatus;
		if (queueStatus.waiting > 1000) {
			output.code = 500;
			output.error = `Queue ${key} has more than 1000 items waiting to be processed: ${
				queueStatus.waiting
			} are waiting`;
		}
	}

	res.status(output.code).send(output);
};

exports.sentryThrow = async (req, res) => {
	Throw();
};

exports.sentryLog = async (req, res) => {
	try {
		Throw();
	} catch (err) {
		logger.error('this is a test error', {
			err,
			tags: { env: 'testing' },
			extra: { additional: 'data', is: 'awesome' },
		});
	}
	try {
		Throw();
	} catch (err) {
		logger.error({ err });
	}

	logger.error('0');
	logger.error('1');

	res.status(200).send('{}');
};
