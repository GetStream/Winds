import config from '../config';

import { StatsD } from 'node-statsd';

var statsDClient = null;

function getStatsDClient() {
	if (!statsDClient) {
		statsDClient = new StatsD({
			host: config.statsd.host,
			port: config.statsd.port,
			prefix: config.statsd.prefix,
			cacheDns: true,
		});
	}
	return statsDClient;
}

async function timeIt(name, fn) {
	let t0 = new Date();
	let r = await fn();
	getStatsDClient().timing(name, new Date() - t0);
	return r;
}

exports.getStatsDClient = getStatsDClient;
exports.timeIt = timeIt;
