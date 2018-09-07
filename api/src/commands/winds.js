#!/usr/bin/env babel-node
import program from 'commander';
import logger from '../utils/logger';

let version;

if (process.env.DOCKER) {
	version = { version: 'DOCKER' };
} else {
	version = require('../../../app/package.json');
}

program
	.version(version)
	.command('og <urls>', 'Debug OG')
	.command('rss', 'Debug RSS feeds')
	.command('podcast', 'Debug Podcasts')
	.command('article', 'Debug Article Parsing')
	.command('discover', 'Debug RSS discovery')
	.command('rebuild-search', 'Rebuild search')
	.command('rehash', 'Rehash articles and episodes')
	.command('truncate-rss-feed <id>', 'Truncate articles for one RSS feed')
	.parse(process.argv);

function main() {
	logger.info('Winds CLI, Have fun!');
}

main();
