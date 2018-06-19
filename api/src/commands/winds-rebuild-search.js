import '../loadenv';
import '../utils/db';

import logger from '../utils/logger';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import { indexMany } from '../utils/search';

async function main() {
	logger.info('Reindexing all Podcasts to Algolia');
	await loadModel(Podcast);
	logger.info('Reindexing all RSS feeds to Algolia');
	await loadModel(RSS);
}

async function loadModel(Model) {
	const batchSize = 200;
	let indexed = 0;
	let accumulatedDocs = [];
	// XXX: enter Mongoose genius: { timeout: true } means disabling cursor timeouts
	await Model.find({ followerCount: { $gte: 1 } }, {}, { timeout: true })
		.cursor()
		.eachAsync(async d => {
			accumulatedDocs.push(d.searchDocument());
			if (accumulatedDocs.length >= batchSize) {
				await indexMany(accumulatedDocs);
				indexed += accumulatedDocs.length;
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				process.stdout.write(`Indexed: ${indexed}`);
				accumulatedDocs = [];
			}
		});
	if (accumulatedDocs.length >= 0) {
		await indexMany(accumulatedDocs);
		indexed += accumulatedDocs.length;
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Indexed: ${indexed}`);
		accumulatedDocs = [];
	}
	process.stdout.write('\n');
}

main()
	.then(() => {
		console.info('done');
		process.exit(0);
	})
	.catch(err => {
		console.info(`failed with err ${err}`);
		process.exit(1);
	});
