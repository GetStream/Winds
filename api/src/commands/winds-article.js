import '../loadenv';
import '../utils/db';

import program from 'commander';
import chalk from 'chalk';
import logger from '../utils/logger';
const version = '0.0.1';
import normalize from 'normalize-url';
import { ParseArticle } from '../parsers/article';

program.version(version).parse(process.argv);

let articleUrls = program.args;

async function main() {
	logger.info('Starting the article parsing debugger \\0/');
	for (let url of articleUrls) {
		let scraped = await ParseArticle(url);
		logger.info(Object.keys(scraped.data));
		logger.info(`excerpt: ${scraped.data.excerpt}`);
	}
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
