import '../loadenv';
import '../utils/db';

import program from 'commander';
import chalk from 'chalk';
import logger from '../utils/logger';
const version = '0.0.1';
import normalize from 'normalize-url';
import { OgQueueAdd } from '../asyncTasks';
import { ParseOG, IsValidOGUrl } from '../parsers/og';

program
	.version(version)
	.option('--type <value>', 'The type: episode, podcast or article')
	.option('--task', 'Create a task on bull or not')
	.parse(process.argv);

let ogUrls = program.args;

async function main() {
	// This is a small helper tool to quickly help debug issues with podcasts or RSS feeds
	logger.info('Starting the OG queue Debugger \\0/');
	for (let ogUrl of ogUrls) {
		let isValid = await IsValidOGUrl(ogUrl);
		if (!isValid) {
			logger.warn(`invalid URL ${ogUrl}`);
			continue;
		}

		let normalizedUrl = normalize(ogUrl);
		if (!normalizedUrl) {
			logger.warn(`no normalized URL for '${ogUrl}'`);
			continue;
		}
		logger.info(`Looking for og images at ${normalizedUrl} for type ${program.type}`);

		let ogImage = await ParseOG(normalizedUrl);

		if (!ogImage) {
			logger.info(
				chalk.red(`OG scraping didn't find an image for ${normalizedUrl}`),
			);
		} else {
			logger.info(chalk.green(`Image found for ${normalizedUrl}: ${ogImage}`));
		}

		if (program.task) {
			logger.info('creating a task on the bull queue');
			let res = await OgQueueAdd(
				{
					url: normalizedUrl,
					type: program.type,
					update: true,
				},
				{
					removeOnComplete: true,
					removeOnFail: true,
				},
			);
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
