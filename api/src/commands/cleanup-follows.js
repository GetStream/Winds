import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';
import Follow from '../models/follow';
import { FollowSchema } from '../models/follow';

import RSS from '../models/rss';
import User from '../models/user';

import asyncTasks from '../asyncTasks';

program.parse(process.argv);

async function main() {
	logger.info(`time to update those follow counts, \\0/`);

	// get the follow counts
	let counts = await Follow.aggregate([
		{
			$group: {
				_id: {
					rss: '$rss',
					podcast: '$podcast',
					user: '$user',
				},
				count: { $sum: 1 },
			},
		},
		{
			$match: {
				count: { $gte: 2 },
			},
		},
	]);
	// group by the number of followers and the type for fast updates
	let grouped = {};
	for (let c of counts) {
		let lookup = c._id;
		let debug = JSON.stringify(lookup);
		if (Object.keys(lookup).length != 2) {
			throw Error(`OH no you dont, broken lookup: ${debug}`);
		}
		let versions = await Follow.find(lookup);
		// remove everything except the first result
		if (versions.length > 1) {
			let removing = versions.length - 1;

			logger.info(`removing ${removing} instances for query ${debug}`);
			for (let v of versions.slice(1)) {
				logger.info(`removing ${v._id}`);
				await v.remove();
			}
		}
	}
	logger.info(`finished cleaning up, applying unqiue index now`);
	await FollowSchema.index({ user: 1, rss: 1, podcast: 1 }, { unique: true });
	logger.info(`done :)`);
}

main()
	.then(result => {
		logger.info('completed it all, we should now have a unique contraint');
	})
	.catch(err => {
		logger.info(`failed with err ${err}`, { err });
	});
