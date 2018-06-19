import '../loadenv';
import '../utils/db';

import logger from '../utils/logger';
import Article from '../models/article';
import RSS from '../models/rss';

async function main() {
	logger.info('Re-hasing all articles');
	await rehashModel(Article);
}

async function rehashModel(Model) {
	let indexed = 0;
	let promises = [];
	let batchSize = 100;

	await Model.find({}, { rss: 0 }, { timeout: true })
		.cursor()
		.eachAsync(async d => {
			d.computeContentHash();
			promises.push(d.save());
			indexed += 1;
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(`Indexed: ${indexed}`);
			if (promises.length > batchSize) {
				await Promise.all(promises);
				promises = [];
			}
		});
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
