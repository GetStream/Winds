import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';

import RSS from '../models/rss';

import asyncTasks from '../asyncTasks';

program
	.option('--all', 'Rescrape articles for which we already have an og image')
	.parse(process.argv);

async function main() {
	let schemas = { article: Article, rss: RSS, episode: Episode, podcast: Podcast };
	let fieldMap = { article: 'url', episode: 'link', podcast: 'url', rss: 'url' };
	logger.info(`program.all is set to ${program.all}`)

	for (const [contentType, schema] of Object.entries(schemas)) {
		let instances = await schema.find({});
		let field = fieldMap[contentType];
		logger.info(
			`Found ${instances.length} for ${contentType} with url field ${field}`,
		);
		let chunkSize = 1000;

		for (let i = 0, j = instances.length; i < j; i += chunkSize) {
			let chunk = instances.slice(i, i + chunkSize);
			let promises = [];
			for (const instance of chunk) {
				let missingImage = !instance.images || !instance.images.og
				if (missingImage || program.all) {
					let promise = asyncTasks.OgQueueAdd(
						{
							type: contentType,
							url: instance[field],
							update: true,
						},
						{
							removeOnComplete: true,
							removeOnFail: true,
						},
					);
					promises.push(promise);
				}
			}
			let results = await Promise.all(promises);
		}

		logger.info(`Completed for type ${contentType} with field ${field}`);
	}
}

main()
	.then(result => {
		logger.info('completed it all, open the test page to see queue status');
	})
	.catch(err => {
		logger.info(`failed with err ${err}`);
	});
