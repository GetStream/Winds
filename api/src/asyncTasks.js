import config from './config';

import Queue from 'bull';
import { getStatsDClient } from './utils/statsd';

export const rssQueue = new Queue('rss', config.cache.uri);
export const ogQueue = new Queue('og', config.cache.uri);
export const podcastQueue = new Queue('podcast', config.cache.uri);
export const streamQueue = new Queue('stream', config.cache.uri, {
	limiter: { max: 7000, duration: 3600000 } // 7k per hour
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

	queue.on('error', function(error) {
		statsd.increment(makeMetricKey(queue, 'error'));
	});

	queue.on('active', function(job, jobPromise) {
		statsd.increment(makeMetricKey(queue, 'active'));
	});

	queue.on('completed', function(job, result) {
		statsd.timing(makeMetricKey(queue, 'elapsed'), new Date() - job.timestamp);
		statsd.increment(makeMetricKey(queue, 'completed'));
	});

	queue.on('failed', function(job, err) {
		statsd.increment(makeMetricKey(queue, 'failed'));
	});

	queue.on('paused', function() {
		statsd.increment(makeMetricKey(queue, 'paused'));
	});

	queue.on('resumed', function(job) {
		statsd.increment(makeMetricKey(queue, 'resumed'));
	});

	setInterval(trackQueueSize, 30000, statsd, queue);
}

AddQueueTracking(rssQueue);
AddQueueTracking(ogQueue);
AddQueueTracking(podcastQueue);
AddQueueTracking(streamQueue);
AddQueueTracking(socialQueue);

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
	ogQueue.process(...arguments);
}

export function ProcessPodcastQueue() {
	getStatsDClient().increment(makeMetricKey(podcastQueue, 'started'));
	podcastQueue.process(...arguments);
}

export function ProcessStreamQueue() {
	getStatsDClient().increment(makeMetricKey(streamQueue, 'started'));
	streamQueue.process(...arguments);
}

export function ProcessSocialQueue() {
	getStatsDClient().increment(makeMetricKey(socialQueue, 'started'));
	socialQueue.process(...arguments);
}
