import '../loadenv';

import Queue from 'bull';
import normalize from 'normalize-url';
import ogs from 'open-graph-scraper';

// rss import model is needed because Article refs it
import RSS from '../models/rss'; // eslint-disable-line
import Article from '../models/article';

import '../utils/db';

import config from '../config';
import logger from '../utils/logger';

const ogQueue = new Queue('og', config.cache.uri);

logger.info('Starting the OG worker');
ogQueue.process(handleJob);

// run the scraping job
function handleJob(job, done) {
	logger.info(`Processing opengraph images for ${job.data.url}...`);

	const url = normalize(job.data.url);

	Article.findOne({ url: url })
		.then(article => {
			// if the article hasn't been created yet, or it already has an OG image, ignore
			if (!article || article.images.og) {
				return;
			} else {
				return ogs({
					followAllRedirects: true,
					maxRedirects: 20,
					timeout: 3000,
					url: url,
				}).then(image => {
					if (!image.data.ogImage || !image.data.ogImage.url) {
						logger.info(`didn't find image for ${url}`);
						return;
					}
					return Article.update(
						{ _id: article._id },
						{ $set: { 'images.og': normalize(image.data.ogImage.url) } },
					);
				});
			}
		})
		.then(() => {
			return done();
		})
		.catch(err => {
			logger.error(`Error retrieving/saving image for article: ${url}`);
			logger.error(err);
			return done(err);
		});
}
