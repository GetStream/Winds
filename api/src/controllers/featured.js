import RSS from '../models/rss';
import Podcast from '../models/podcast';

import config from '../config';
import packageInfo from '../../../app/package.json';

import Redis from 'ioredis';
const cache = new Redis(config.cache.uri);

exports.list = async (req, res) => {
	const cacheKey = `featured:v${packageInfo.version.replace(/\./g, ':')}`;

	let resultString = await cache.get(cacheKey);
	let results = JSON.parse(resultString);

	if (!results) {
		const rss = await RSS.find({ featured: true }).lean();
		results = [];
		rss.map(feed => {
			feed.type = 'rss';
			results.push(feed);
		});

		const podcasts = await Podcast.find({ featured: true }).lean();
		podcasts.map(podcast => {
			podcast.type = 'podcast';
			results.push(podcast);
		});

		await cache.set(cacheKey, JSON.stringify(results), 'EX', 60 * 30);
	}

	let shuffled = results
		.map(a => [Math.random(), a])
		.sort((a, b) => a[0] - b[0])
		.map(a => a[1]);

	res.json(shuffled);
};
