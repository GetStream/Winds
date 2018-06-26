import RSS from '../models/rss';
import Podcast from '../models/podcast';

import config from '../config';
import packageInfo from '../../../app/package.json';

import Redis from 'ioredis';
const cache = new Redis(config.cache.uri);

exports.list = async (req, res) => {
	const cacheKey = `featured:v${packageInfo.version.replace(/\./g, ':')}`;

	let str = await cache.get(cacheKey);
	let data = JSON.parse(str);

	if (!data) {
		const rss = await RSS.find({ featured: true }).lean();
		data = [];
		rss.map(feed => {
			feed.type = 'rss';
			data.push(feed);
		});

		const podcasts = await Podcast.find({ featured: true }).lean();
		podcasts.map(podcast => {
			podcast.type = 'podcast';
			data.push(podcast);
		});

		await cache.set(cacheKey, JSON.stringify(data), 'EX', 60 * 30);
	}

	let shuffled = data
		.map(a => [Math.random(), a])
		.sort((a, b) => a[0] - b[0])
		.map(a => a[1]);

	res.json(shuffled);
};
