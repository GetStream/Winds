import '../loadenv';

import Queue from 'bull';
import normalize from 'normalize-url';
import ogs from 'open-graph-scraper';

// rss import model is needed because Article refs it
import RSS from '../models/rss'; // eslint-disable-line
import Podcast from '../models/podcast'; // eslint-disable-line

import Article from '../models/article';
import Episode from '../models/episode';

import '../utils/db';
import { Raven } from '../utils/errors';

import config from '../config';
import logger from '../utils/logger';

const schemaMap = {
	episode: Episode,
	podcast: Podcast,
};
const requestTimeout = 10000;
const maxRedirects = 10;

const ogQueue = new Queue('og', config.cache.uri);

logger.info('Starting the OG worker, now supporting podcasts, episodes and articles');
ogQueue.process(15, handleJob);

// Run the OG scraping job
async function handleJob(job) {
	logger.info(`Processing opengraph images for ${job.data.url}...`);
	// Note dont normalize the url, this is done when the object is created
	const url = job.data.url;
	const jobType = job.data.type;
	let context = { jobType, url };

	// Lookup the right type of schema: article, episode or podcast
	let mongoSchema = schemaMap[jobType] || Article;
	let field = job.data.type === 'podcast' ? 'link' : 'url';

	// if the instance hasn't been created yet, or it already has an OG image, ignore
	let instance = await mongoSchema.findOne({ [field]: url });


	if (!instance || instance.images.og) {
		return;
	} else if (url.endsWith('.mp3')) {
		// ends with mp3, no point in scraping, returning early
		return;
	} else {
		// TODO: on failure conditions the ogs script has some leaks
		try {
			let image = await ogs({
				followAllRedirects: true,
				maxRedirects: maxRedirects,
				timeout: requestTimeout,
				url: url,
			});
		} catch (e) {
			logger.info(`OGS scraping broke for URL ${url}`)
			return
		}

		if (!image.data.ogImage || !image.data.ogImage.url) {
			logger.info(`Didn't find image for ${url}`)
			return
		} else {
			logger.info(`Found an image for ${url}`)
			let images = instance.images || {}
			images.og = normalize(image.data.ogImage.url)
			let result = await mongoSchema.update(
				{ _id: instance._id },
				{ $set: { images: images } },
			)
		}
	}

	//let msg = 'Error retrieving/saving image for OG scraping';
	//Raven.captureException(err);
}
