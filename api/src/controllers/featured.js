import RSS from '../models/rss';
import Podcast from '../models/podcast';

import config from '../config';

let packageInfo;
if (process.env.DOCKER) {
	packageInfo = { version: 'DOCKER' };
} else {
	packageInfo = require('../../../app/package.json');
}

import Redis from 'ioredis';
const cache = new Redis(config.cache.uri);

exports.list = async (req, res) => {
	const cacheKey = `featured:v${packageInfo.version.replace(/\./g, ':')}`;

	let str = await cache.get(cacheKey);
	let data = JSON.parse(str);

	if (!data) {
		data = [];

		const rss = await RSS.find({ featured: true });
		rss.map(doc => {
			let r = doc.toObject();
			r.type = 'rss';
			data.push(r);
		});

		const podcasts = await Podcast.find({ featured: true });
		podcasts.map(doc => {
			let p = doc.toObject();
			p.type = 'podcast';
			data.push(p);
		});

		await cache.set(cacheKey, JSON.stringify(data), 'EX', 60 * 30);
	}

	let shuffled = data
		.map(a => [Math.random(), a])
		.sort((a, b) => a[0] - b[0])
		.map(a => a[1]);

	res.json(shuffled);
};
