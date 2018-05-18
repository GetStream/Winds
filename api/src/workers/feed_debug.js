import '../loadenv';
import '../utils/db';
import { ParseFeed, ParsePodcast } from './parsers';
import program from 'commander';
import chalk from 'chalk';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import config from '../config';
import Queue from 'bull';

const rssQueue = new Queue('rss', config.cache.uri);
const podcastQueue = new Queue('podcast', config.cache.uri);

const version = '0.1.1';

program
	.version(version)
	.option('--rss <value>', 'Parse a specific RSS feed')
	.option('--podcast <value>', 'Parse a specific podcast')
	.option('-l, --limit <n>', 'The number of articles to parse', 2)
	.option('--task', 'Create a task on bull or not')
	.parse(process.argv);

function main() {
	// This is a small helper tool to quickly help debug issues with podcasts or RSS feeds
	logger.info('Starting the RSS Debugger \\0/');
	logger.info(
		'Please report issues with RSS feeds here https://github.com/getstream/winds',
	);
	logger.info('Note that pull requests are much appreciated!');
	let target = program.rss || program.podcast;
	logger.info(`Looking up the first ${program.limit} articles from ${target}`);

	function validate(response, error) {
		if (error) {
			console.warn(error)
			return
		}

		// validate the podcast or RSS feed
		logger.info(`========== Validating Publication ==========`)
		logger.info(`Title: ${response.title}`)
		logger.info(`Link: ${response.link}`)
		if (response.image && response.image.og) {
			logger.info(chalk.green('Image found :)'));
			logger.info(`Image: ${response.image.og}`);
		} else {
			logger.info(chalk.red('Image missing :('));
		}

		logger.info(`========== Validating episodes/articles now ==========`)

		// validate the articles or episodes
		let articles = (response.articles) ? response.articles : response.episodes;
		let selectedArticles = articles.slice(0, program.limit);
		logger.info(`Found ${articles.length} articles showing ${program.limit}`);

		if (selectedArticles.length) {
			for (let article of selectedArticles) {
				logger.info('======================================');
				logger.info(chalk.green(`Title: ${article.title}`));
				logger.info(`URL: ${article.url}`);
				logger.info(`Description: ${article.description}`);
				logger.info(`Publication Date: ${article.publicationDate}`);
				if (article.commentUrl) {
					logger.info(`Comments: ${article.commentUrl}`);
				}
				if (article.content) {
					logger.info(`Content: ${article.content}`);
				}

				// for RSS we rely on OG scraping, for podcasts the images are already in the feed
				if (article.images && article.images.og) {
					logger.info(chalk.green('Image found :)'));
					logger.info(`Image: ${article.images.og}`);
				} else {
					logger.info(chalk.red('Image missing :('));
				}
				if (program.podcast) {
					if (article.enclosure) {
						logger.info(chalk.green('Enclosure found :)'))
						logger.info(article.enclosure)
					} else {
						logger.info(chalk.red('Missing enclosure :('))
					}
				}

			}
		} else {
			logger.info(chalk.red('Didn\'t find any articles or episodes.'));
		}

		let schema = (program.rss) ? RSS : Podcast
		let lookup = {feedUrl: target}
		if (program.task) {
			logger.info(`trying to create a task on the bull queue`)
			schema.findOne(lookup).catch(err => {
					console.log('failed', err)
				}).then(instance => {

				if (program.rss) {
					logger.info(`scheduled RSS feed to the queue for parsing ${target}`)
					rssQueue.add(
						{
							rss: instance._id,
							url: instance.feedUrl,
							update: true
						},
						{
							priority: 1,
							removeOnComplete: true,
							removeOnFail: true,
						})
				} else {
					logger.info(`scheduled Podcast to the queue for parsing ${target}`)

					podcastQueue.add(
						{
							podcast: instance._id,
							url: instance.feedUrl,
							update: true
						},
						{
							priority: 1,
							removeOnComplete: true,
							removeOnFail: true,
						})
				}
			})
		}
	}


	if (program.rss) {
		ParseFeed(program.rss, validate);
	} else {
		ParsePodcast(program.podcast, validate);
	}
	logger.info(
		'Note that upgrading feedparser can sometimes improve parsing.',
	);


}

main();
