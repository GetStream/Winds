import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';
import Follow from '../models/follow';
import RSS from '../models/rss';

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
				},
				followers: { $sum: 1 },
			},
		},
	]);
	// group by the number of followers and the type for fast updates
	let grouped = {};
	for (let c of counts) {
		c.type = c._id.rss ? 'rss' : 'podcast';
		c.publicationID = c._id[c.type];
		let key = [c.followers, c.type];
		if (key in grouped) {
			grouped[key].push(c);
		} else {
			grouped[key] = [c];
		}
	}
	// update time
	for (let group of Object.values(grouped)) {
		let publicationIDs = group.map((c) => {
			return c.publicationID;
		});
		let schema = group[0].type == 'rss' ? RSS : Podcast;
		let followerCount = group[0].followers;
		logger.info(
			`Starting update of ${publicationIDs.length} publications of type ${group[0].type} to count ${followerCount}`,
		);
		let result = await schema.update(
			{
				$and: [
					{ _id: { $in: publicationIDs } },
					{ followerCount: { $ne: followerCount } },
				],
			},
			{
				followerCount: followerCount,
			},
			{ multi: true },
		);
		logger.info(`Updated ${result.nModified} out of ${publicationIDs.length}`);
	}

	// set everyone else to 0
	for (let schema of [RSS, Podcast]) {
		let result = await schema.update(
			{ followerCount: { $exists: false } },
			{
				followerCount: 0,
			},
			{ multi: true },
		);
		logger.info(`Updated ${result.nModified} with no values to 0`);
	}
}

main()
	.then((result) => {
		logger.info('completed it all, open the test page to see queue status');
	})
	.catch((err) => {
		logger.info(`failed with err ${err}`, { err });
	});
