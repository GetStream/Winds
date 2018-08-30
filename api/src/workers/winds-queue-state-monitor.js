import Redis from 'ioredis';

import config from '../config';
import { getStatsDClient } from '../utils/statsd';

const redis = new Redis(config.cache.uri);
const statsd = getStatsDClient();

function countSetElements(key) {
	return redis.zcount(key, '-inf', '+inf');
}

function countLockTypes(pattern) {
	return new Promise((resolve, reject) => {
		const result = {};
		const stream = redis.scanStream({ match: `${pattern}:*`, count: 100 });
		stream.on('data', data => {
			const types = data.map(key => key.split(':')[3]);
			for (const type of types) {
				result[type] = result[type] || 0;
				result[type] += 1;
			}
		});
		stream.on('end', () => resolve(result));
		stream.on('error', reject);
	});
}

async function main() {
	for (const queueName of ['rss', 'podcast']) {
		const key = `queue-status:${queueName}`;
		const count = await countSetElements(key);
		statsd.gauge(`winds.queue.${queueName}.flags.${queueName}`, count);
		console.log(`${queueName} total: ${count}`);
		statsd.gauge(`winds.queue.${queueName}.flags.total`, count);
	}
	for (const queueName of ['og', 'stream', 'social']) {
		const prefix = `queue-status:${queueName}`;
		const types = await countLockTypes(prefix);
		let total = 0;
		for (const [type, count] of Object.entries(types)) {
			statsd.gauge(`winds.queue.${queueName}.flags.${type}`, count);
			console.log(`${queueName} type ${type}: ${count}`);
			total += count;
		}
		statsd.gauge(`winds.queue.${queueName}.flags.total`, total);
		console.log(`${queueName} total: ${total}`);
	}
}

main()
	.then(() => {
		console.info('done');
		setTimeout(process.exit.bind(process, 0), 2000);
	})
	.catch(err => {
		console.info(`failed with err ${err.stack}`);
		setTimeout(process.exit.bind(process, 1), 2000);
	});
