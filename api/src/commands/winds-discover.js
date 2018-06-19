import '../loadenv';
import '../utils/db';

import program from 'commander';
import chalk from 'chalk';
import logger from '../utils/logger';
const version = '0.0.1';
import normalize from 'normalize-url';
import asyncTasks from '../asyncTasks';
import { ParseArticle } from '../parsers/article';
import { discoverRSS } from '../parsers/discovery';

program.version(version).parse(process.argv);

let pageUrls = program.args;

async function main() {
	logger.info('Starting the article parsing debugger \\0/');
	for (let url of pageUrls) {
		let foundRSS = await discoverRSS(normalize(url));

		if (!foundRSS.feedUrls.length) {
			logger.info('no RSS found');
			return;
		}
		let site = foundRSS.site;
		logger.info(`Site Information`);
		logger.info(`Title: ${site.title}, URL: ${site.url}, Favicon: ${site.favicon}`);
		logger.info(`Favicon ${foundRSS.site.favicon}`);
		logger.info(`RSS feeds found: ${foundRSS.feedUrls.length}`);
		for (let found of foundRSS.feedUrls) {
			logger.info(`Title: ${found.title} URL: ${found.url}`);
		}
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
