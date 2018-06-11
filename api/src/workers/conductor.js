import '../loadenv';
import '../utils/db';

import moment from 'moment';

import RSS from '../models/rss';
import Podcast from '../models/podcast';

import logger from '../utils/logger';

import asyncTasks from '../asyncTasks';

const publicationTypes = {
	rss: { schema: RSS, enqueue: asyncTasks.RssQueueAdd },
	podcast: { schema: Podcast, enqueue: asyncTasks.PodcastQueueAdd },
};
const conductorInterval = 60;
const durationInMinutes = 15;

// conductor runs conduct every interval seconds
const conductor = () => {
	logger.info(`Starting the conductor... will conduct every ${conductorInterval} seconds`);

	function forever() {
		conduct().then(()=> {
			logger.info('Conductor iteration completed...');
		}).catch(err => {
			logger.error('Conductor broke down', {err});
		});
		setTimeout(forever, conductorInterval * 1000);
	}
	forever();
};
conductor();

// returns a random number from 2**1, 2**2, ..., 2**n-1, 2**n
// 2 is two time more likely to be returned than 4, 4 than 8 and so until 2**n
function rand(n=6){
	const exp = n;
	let rand = Math.floor(Math.random() * 2**exp);
	let b;
	for (b of [...Array(exp).keys()].reverse()) {
		if (rand >= (2**b)-1) {
			break;
		}
	}
	return 2**(exp-b);
}

// conduct does the actual work of scheduling the scraping
async function conduct() {
	for (const [publicationType, publicationConfig] of Object.entries(publicationTypes)) {
		// lookup the total number of rss feeds or podcasts
		let total = await publicationConfig.schema.count({});
		// never schedule more than 1/15 per minute interval
		let maxToSchedule = Math.ceil(total / 15 + 1);
		logger.info(
			`conductor will schedule at most ${maxToSchedule} to scrape per ${conductorInterval} seconds`,
		);

		// find the publications that we need to update
		let publications = await publicationConfig.schema
			.find({
				isParsing: {
					$ne: true,
				},
				valid: true,
				lastScraped: {
					$lte: moment()
						.subtract(durationInMinutes, 'minutes')
						.toDate(),
				},
				consecutiveScrapeFailures: {
					$lte: rand(),
				},
			})
			.limit(maxToSchedule);

		// make sure we don't schedule these guys again till its finished
		let publicationIDs = [];
		for (let publication of publications) {
			publicationIDs.push(publication._id);
		}
		let updated = await publicationConfig.schema.update(
			{ _id: { $in: publicationIDs } },
			{
				isParsing: true,
			},
			{
				multi: true,
			},
		);
		logger.info(`marked ${updated.nModified} publications as isParsing`);

		// actually schedule the update
		logger.info(`conductor found ${publications.length} of type ${publicationType} to scrape`);
		let promises = [];
		for (let publication of publications) {
			let job = { url: publication.feedUrl };
			job[publicationType] = publication._id;
			let promise = publicationConfig.enqueue(job, {
				removeOnComplete: true,
				removeOnFail: true,
			});
			promises.push(promise);
		}
		await Promise.all(promises);

		logger.info(`Processing complete! Will try again in ${conductorInterval} seconds...`);
	}
}
