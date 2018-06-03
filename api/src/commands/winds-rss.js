import program from 'commander';
import '../loadenv';
import '../utils/db';
import { debugFeed } from './_debug-feed';

program
	.option('-t, --task', 'create a task')
	.option('-l, --limit <n>', 'The number of articles to parse', 2)
	.action((feedUrl, cmd) => {
		debugFeed('rss', [feedUrl]);
	})
	.parse(process.argv);
