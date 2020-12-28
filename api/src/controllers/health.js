import Article from '../models/article';
import Episode from '../models/episode';
import RSS from '../models/rss';
import Podcast from '../models/podcast';
import moment from 'moment';
import config from '../config';
import { Throw } from '../utils/errors';
import Queue from 'bull';
import Arena from 'bull-arena';
import logger from '../utils/logger';

let version;
if (process.env.DOCKER) {
	version = 'DOCKER';
} else {
	version = require('../../../app/package.json').version;
}

const rssQueue = new Queue('rss', config.cache.uri);
const ogQueue = new Queue('og', config.cache.uri);
const podcastQueue = new Queue('podcast', config.cache.uri);
const socialQueue = new Queue('socail', config.cache.uri);
const streamQueue = new Queue('stream', config.cache.uri);

const tooOld = 3 * 60 * 60 * 1000;

const queues = {
	'RSS Queue': rssQueue,
	'OG Queue': ogQueue,
	'Podcast Queue': podcastQueue,
	'Social Score Queue': socialQueue,
	'Personalisation-sync Queue': streamQueue,
};

const queueTTL = 24 * 60 * 60 * 1000; // 1 day

const queueCompletedCleanup = async (queue) => {
	await queue.clean(queueTTL, 'completed'); // cleans all jobs that completed over 1 day ago.
};

const queueFailedCleanup = async (queue) => {
	await queue.clean(queueTTL, 'failed'); // clean all jobs that failed over 1 day ago
};

queueCompletedCleanup(rssQueue);
queueCompletedCleanup(ogQueue);
queueCompletedCleanup(podcastQueue);
queueCompletedCleanup(socialQueue);
queueCompletedCleanup(streamQueue);

queueFailedCleanup(rssQueue);
queueFailedCleanup(ogQueue);
queueFailedCleanup(podcastQueue);
queueFailedCleanup(socialQueue);
queueFailedCleanup(streamQueue);

exports.health = async (req, res) => {
	res.status(200).send({ version, healthy: '100%' });
};

exports.status = async (req, res) => {
	const output = { version, code: 200, rss: {}, podcast: {} };

	const latestArticle = await Article.findOne().sort({ _id: -1 });
	const latestEpisode = await Episode.findOne().sort({ _id: -1 });

	const now = new Date();

	output.now = now;
	if (latestArticle) {
		output.mostRecentArticle = moment(latestArticle.createdAt).fromNow();
		if (now - latestArticle.createdAt > tooOld) {
			output.code = 500;
			output.error = 'The most recent article is too old.';
		}
	} else {
		output.mostRecentArticle = -1;
	}
	if (latestEpisode) {
		output.mostRecentEpisode = moment(latestEpisode.createdAt).fromNow();
		if (now - latestEpisode.createdAt > tooOld) {
			output.code = 500;
			output.error = 'The most recent episode is too old.';
		}
	} else {
		output.mostRecentEpisode = -1;
	}

	output.rss.parsing = await RSS.count({ 'queueState.isParsing': true });
	output.rss.og = await RSS.count({ 'queueState.isUpdatingOG': true });
	output.rss.stream = await RSS.count({ 'queueState.isSynchronizingWithStream': true });
	output.rss.social = await RSS.count({ 'queueState.isFetchingSocialScore': true });
	output.podcast.parsing = await Podcast.count({ 'queueState.isParsing': true });
	output.podcast.og = await Podcast.count({ 'queueState.isUpdatingOG': true });
	output.podcast.stream = await Podcast.count({
		'queueState.isSynchronizingWithStream': true,
	});

	if (output.rss.parsing > 2000) {
		output.code = 500;
		output.error = `There are too many RSS feeds currently parsing ${output.rssCurrentlyParsing}`;
	}

	if (output.podcast.parsing > 500) {
		output.code = 500;
		output.error = `There are too many Podcast feeds currently parsing ${output.podcastCurrentlyParsing}`;
	}

	res.status(output.code).json(output);
};

exports.queue = async (req, res) => {
	let output = { version, code: 200 };

	for (const [key, queue] of Object.entries(queues)) {
		let queueStatus = await queue.getJobCounts();
		output[key] = queueStatus;
		if (queueStatus.waiting > 2500) {
			output.code = 500;
			output.error = `Queue ${key} has more than 2500 items waiting to be processed: ${queueStatus.waiting} are waiting`;
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

exports.bullArena = Arena(
	{
		Bull: Queue,
		queues: [
			{
				type: 'bull',
				hostId: 'local',
				name: 'rss',
				url: config.cache.uri,
			},
			{
				type: 'bull',
				hostId: 'local',
				name: 'podcast',
				url: config.cache.uri,
			},
			{
				type: 'bull',
				hostId: 'local',
				name: 'og',
				url: config.cache.uri,
			},
			{
				type: 'bull',
				hostId: 'local',
				name: 'social',
				url: config.cache.uri,
			},
			{
				type: 'bull',
				hostId: 'local',
				name: 'stream',
				url: config.cache.uri,
			},
		],
	},
	{ disableListen: true },
);
