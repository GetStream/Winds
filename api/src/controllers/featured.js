import RSS from '../models/rss';
import Podcast from '../models/podcast';

exports.list = async (req, res) => {
	let results = [];

	let rss = await RSS.find({ featured: true }).lean();
	rss.map(feed => {
		feed.type = 'rss';
		results.push(feed);
	});

	let podcasts = await Podcast.find({ featured: true }).lean();
	podcasts.map(podcast => {
		podcast.type = 'podcast';
		results.push(podcast);
	});

	let shuffled;
	shuffled = results.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
	res.json(shuffled);
};
