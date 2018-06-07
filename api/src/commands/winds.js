#!/usr/bin/env babel-node
import program from 'commander';
import logger from '../utils/logger';


import { version } from '../../../app/package.json';

program
	.version(version)
	.command('og <urls>', 'Debug OG')
	.command('rss', 'Debug RSS feeds')
	.command('podcast', 'Debug Podcasts')
	.command('article', 'Debug Article Parsing')
	.command('discover', 'Debug RSS discovery')
	.command('rebuild-search', 'Rebuild search')
	.command('truncate-rss-feed <id>', 'Truncate articles for one RSS feed')
	.parse(process.argv);

function main() {
	logger.info('Winds CLI, Have fun!');
}

main();
