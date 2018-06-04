#!/usr/bin/env ./node_modules/.bin/babel-node
import program from 'commander';
import logger from '../utils/logger';

import { version } from '../../../app/package.json';

program
	.version(version)
	.command('og <urls>', 'Debug OG')
	.command('rss', 'Debug RSS feeds')
	.command('podcast', 'Debug Podcasts')
	.command('rebuild-search', 'Rebuild search')
	.parse(process.argv);

function main() {
	logger.info('Winds CLI, Have fun!');
}

main();
