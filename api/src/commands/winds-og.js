import program from 'commander';
import chalk from 'chalk';
import logger from '../utils/logger';
import Queue from 'bull';
import config from '../config';
const version = '0.0.1';
import normalize from 'normalize-url';
import async_tasks from '../async_tasks';
import {ParseOG} from '../parsers/og';


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
		let normalizedUrl = normalize(ogUrl);
		logger.info(`Looking for og images at ${normalizedUrl} for type ${program.type}`);

		let ogImage = await ParseOG(normalizedUrl);

		if (!ogImage) {
			logger.info(
				chalk.red(`OG scraping didn't find an image for ${normalizedUrl}`),
			);
		} else {
			logger.info(
				chalk.green(
					`Image found for ${normalizedUrl}: ${ogImage}`,
				),
			);
		}

		if (program.task) {
			logger.info('creating a task on the bull queue');
			async_tasks
				.OgQueueAdd(
					{
						url: normalizedUrl,
						type: program.type,
						update: true,
					},
					{
						removeOnComplete: true,
						removeOnFail: true,
					},
				)
				.then(() => {
					logger.info('task sent to bull, time to run pm2 log og');
				})
				.catch(err => {
					logger.error('Failed to schedule task on og queue');
				});
		}
	}
}

main();
