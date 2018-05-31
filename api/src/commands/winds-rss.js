import program from 'commander';
import '../loadenv';
import '../utils/db';
import { ParseFeed, ParsePodcast } from '../parsers';
import chalk from 'chalk';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import config from '../config';
import { debugFeed } from './_debug-feed';
import async_tasks from '../async_tasks';

program
	.option('-t, --task', 'create a task')
	.option('-l, --limit <n>', 'The number of articles to parse', 2)
	.action((feedUrl, cmd) => {
		debugFeed('rss', [feedUrl]);
	})
	.parse(process.argv);
