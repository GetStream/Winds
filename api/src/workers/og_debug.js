import program from 'commander';
import chalk from 'chalk';
import logger from '../utils/logger';
import Queue from 'bull';
import config from '../config';
const version = '0.0.1';
const ogQueue = new Queue('og', config.cache.uri);
import ogs from 'open-graph-scraper';

program
	.version(version)
	.option('--type <value>', 'The type: episode, podcast or article')
	.option('--url <value>', 'The url to try and scrape')
  .option('--task', 'Create a task on bull or not')
	.parse(process.argv);

function main() {
	// This is a small helper tool to quickly help debug issues with podcasts or RSS feeds
	logger.info('Starting the OG queue Debugger \\0/');
	logger.info(`Looking for og images at ${program.url} for type ${program.type}`);

  ogs({
    followAllRedirects: true,
    maxRedirects: 20,
    timeout: 3000,
    url: program.url,
  }).then(image => {

    if (!image.data.ogImage || !image.data.ogImage.url) {
      logger.info(chalk.red(`OG scraping didn't find an image for ${program.url}`));
    } else {
      logger.info(chalk.green(`Image found for ${program.url}: ${image.data.ogImage.url}`));
    }

    if (program.task) {
      logger.info(`creating a task on the bull queue`)
      ogQueue.add(
        {
          url: program.url,
          type: program.type,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
      logger.info(`task sent to bull, time to run pm2 log og`)
    }

  });
}

main();
