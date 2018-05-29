import program from 'commander'
const version = '0.0.1'
import async_tasks from '../async_tasks'
import handleOg from '../workers/og'
import handleRSS from '../workers/rss'
import handlePodcast from '../workers/podcast'
import conductor from '../workers/conductor';
import logger from '../utils/logger';

program
	.version(version)
	.option('--concurrency [concurrency]', 'Concurrency settings per queue', 30)
	.parse(process.argv);

const queuesDef = {
	'og': (c) => {
		async_tasks.ProcessOgQueue(c, handleOg)
	},
	'rss': (c) => {
		async_tasks.ProcessRssQueue(c, handleRSS)
	},
	'conductor': (c) => {
		conductor()
	},
	'podcast': (c) => {
		async_tasks.ProcessPodcastQueue(c, handlePodcast)
	},
}


function main() {
	if (program.args.length !== 1) {
		throw new Error(`only one queue is allowed`)
	}

	let queue = program.args[0];

	if (Object.keys(queuesDef).indexOf(queue) === -1) {
		throw new Error(`${queue} is not handled`)
	}

	logger.info(`Processing ${queue} with concurrency ${program.concurrency}`)
	queuesDef[queue](program.concurrency)
}

main();
