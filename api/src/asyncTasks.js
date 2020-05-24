import config from './config';
import logger from './utils/logger';

import Queue from 'bull';
import { getStatsDClient } from './utils/statsd';

export const rssQueue = new Queue('rss', config.cache.uri, {
	settings: {
		lockDuration: 90000,
		stalledInterval: 75000,
		maxStalledCount: 2,
	},
});

export const podcastQueue = new Queue('podcast', config.cache.uri, {
	settings: {
		lockDuration: 90000,
		stalledInterval: 75000,
		maxStalledCount: 2,
	},
});

export const streamQueue = new Queue('stream', config.cache.uri, {
	limiter: { max: 12000, duration: 3600000 }, // 12k per hour
});

export const ogQueue = new Queue('og', config.cache.uri, {
	settings: {
		lockDuration: 60000,
		stalledInterval: 50000,
		maxStalledCount: 2,
	},
});
export const socialQueue = new Queue('social', config.cache.uri);

function makeMetricKey(queue, event) {
	return ['winds', 'bull', queue.name, event].join('.');
}

async function trackQueueSize(statsd, queue) {
	let queueStatus = await queue.getJobCounts();
	statsd.gauge(makeMetricKey(queue, 'waiting'), queueStatus.waiting);
	statsd.gauge(makeMetricKey(queue, 'active'), queueStatus.active);
}

function AddQueueTracking(queue) {
	var statsd = getStatsDClient();

	queue.on('error', function (err) {
		statsd.increment(makeMetricKey(queue, 'error'));
		logger.warn(
			`Queue ${queue.name} encountered an unexpected error: ${err.message}`,
		);
	});

	queue.on('active', function (job, jobPromise) {
		statsd.increment(makeMetricKey(queue, 'active'));
	});

	queue.on('completed', function (job, result) {
		statsd.timing(makeMetricKey(queue, 'elapsed'), new Date() - job.timestamp);
		statsd.increment(makeMetricKey(queue, 'completed'));
	});

	queue.on('stalled', function (job) {
		statsd.increment(makeMetricKey(queue, 'stalled'));
		logger.warn(`Queue ${queue.name} job stalled: '${JSON.stringify(job)}'`);
	});

	queue.on('failed', function (job, err) {
		statsd.increment(makeMetricKey(queue, 'failed'));
		logger.warn(
			`Queue ${queue.name} failed to process job '${JSON.stringify(job)}': ${
				err.message
			}`,
		);
	});

	queue.on('paused', function () {
		statsd.increment(makeMetricKey(queue, 'paused'));
	});

	queue.on('resumed', function (job) {
		statsd.increment(makeMetricKey(queue, 'resumed'));
	});

	setInterval(trackQueueSize, 30000, statsd, queue);
}

const currentEnvironment = process.env.NODE_ENV || 'development';
if (currentEnvironment !== 'test') {
	AddQueueTracking(rssQueue);
	AddQueueTracking(ogQueue);
	AddQueueTracking(podcastQueue);
	AddQueueTracking(streamQueue);
	AddQueueTracking(socialQueue);
}

export const RssQueueAdd = rssQueue.add.bind(rssQueue);
export const OgQueueAdd = ogQueue.add.bind(ogQueue);
export const PodcastQueueAdd = podcastQueue.add.bind(podcastQueue);
export const StreamQueueAdd = podcastQueue.add.bind(streamQueue);
export const SocialQueueAdd = podcastQueue.add.bind(socialQueue);

export function ProcessRssQueue() {
	getStatsDClient().increment(makeMetricKey(rssQueue, 'started'));
	return rssQueue.process(...arguments);
}

export function ProcessOgQueue() {
	getStatsDClient().increment(makeMetricKey(ogQueue, 'started'));
	return ogQueue.process(...arguments);
}

export function ProcessPodcastQueue() {
	getStatsDClient().increment(makeMetricKey(podcastQueue, 'started'));
	return podcastQueue.process(...arguments);
}

export function ProcessStreamQueue() {
	getStatsDClient().increment(makeMetricKey(streamQueue, 'started'));
	return streamQueue.process(...arguments);
}

export function ProcessSocialQueue() {
	getStatsDClient().increment(makeMetricKey(socialQueue, 'started'));
	return socialQueue.process(...arguments);
}

export function ShutDownRssQueue() {
	getStatsDClient().increment(makeMetricKey(rssQueue, 'stopped'));
	return socialQueue.close(...arguments);
}

export function ShutDownPodcastQueue() {
	getStatsDClient().increment(makeMetricKey(podcastQueue, 'stopped'));
	return socialQueue.close(...arguments);
}

export function ShutDownOgQueue() {
	getStatsDClient().increment(makeMetricKey(ogQueue, 'stopped'));
	return socialQueue.close(...arguments);
}

export function ShutDownSocialQueue() {
	getStatsDClient().increment(makeMetricKey(socialQueue, 'stopped'));
	return socialQueue.close(...arguments);
}

export function ShutDownStreamQueue() {
	getStatsDClient().increment(makeMetricKey(streamQueue, 'stopped'));
	return socialQueue.close(...arguments);
}
