import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import { discoverRSS } from '../parsers/discovery';

program
	.option('--all', 'Rescrape articles for which we already have a favicon image')
	.option('-c, --concurrency <n>', 'The number of concurrent scraping updates', 100)
	.parse(process.argv);

async function rescrapeFavicon(instance, schema, counts) {
	try {
		let foundRSS = await discoverRSS(instance.url);

		if (foundRSS && foundRSS.site && foundRSS.site.favicon) {
			let site = foundRSS.site;
			const images = instance.images || {};
			images.favicon = site.favicon;
			let updated = await schema.update({ _id: instance._id }, { images });
			counts.fixed += 1;
			return updated;
		} else {
			counts.notfound += 1;
			return;
		}
	} catch (err) {
		logger.warn(
			`rescraping failed with error for url ${instance.url} with instance id ${
				instance._id
			}`,
			{ err },
		);
	}
}

async function main() {
	let schemas = { rss: RSS, podcast: Podcast };
	logger.info(`program.all is set to ${program.all}`);

	let counts = { hasimage: 0, fixed: 0, notfound: 0 };
	let lookup = { url: { $nin: [null, ''] } };
	if (!program.all) {
		lookup['images.favicon'] = { $in: [null, ''] };
	}
	let chunkSize = parseInt(program.concurrency, 10);
	console.log(typeof chunkSize, chunkSize);

	for (const [contentType, schema] of Object.entries(schemas)) {
		let total = await schema.count(lookup);
		let completed = 0;

		logger.info(
			`Found ${total} for ${contentType}, processing in chunks of ${chunkSize}`,
		);

		for (let i = 0, j = total; i < j; i += chunkSize) {
			let chunk = await schema
				.find(lookup)
				.skip(i)
				.limit(chunkSize)
				.lean();
			completed = completed + chunkSize;

			let promises = [];
			for (const instance of chunk) {
				let missingImage = !instance.images || !instance.images.favicon;
				if (missingImage || program.all) {
					let promise = rescrapeFavicon(instance, schema, counts);
					promises.push(promise);
				} else {
					counts.hasimage += 1;
				}
			}
			let results = await Promise.all(promises);
			console.log('completed', completed);
		}

		console.log('counts', counts);
		logger.info(`Completed for type ${contentType}`);
	}
}

main()
	.then(result => {
		logger.info('completed it all');
	})
	.catch(err => {
		logger.warn(`failed with err ${err}`);
	});
