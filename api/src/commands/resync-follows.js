import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Follow from '../models/follow';
import { FollowSchema } from '../models/follow';
import asyncTasks from '../asyncTasks';

import stream from 'getstream';
import config from '../config';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

program.parse(process.argv);

async function main() {
	logger.info(`time to resync those follows, \\0/`);

	let followCount = await Follow.count({});
	let chunkSize = 500;

	for (let i = 0, j = followCount; i < j; i += chunkSize) {
		let follows = await Follow.find({}).skip(i).limit(chunkSize).lean();
		logger.info(`found ${follows.length} follows`);
		let feedRelations = [];
		for (let f of follows) {
			let feedGroup = f.rss ? 'user_article' : 'user_episode';
			let type = f.rss ? 'rss' : 'podcast';
			let publicationID = f.rss || f.podcast;
			// sync to stream
			feedRelations.push({
				source: `timeline:${f.user}`,
				target: `${type}:${publicationID}`,
			});
			feedRelations.push({
				source: `${feedGroup}:${f.user}`,
				target: `${type}:${publicationID}`,
			});
		}
		logger.info(`pushed ${feedRelations.length} follows to Stream`);
		logger.info(`completed ${i} out of ${followCount}`);
		let response = await streamClient.followMany(feedRelations);
	}
	logger.info(`completed all loops`);
}

main()
	.then((result) => {
		logger.info('completed it all, we should now have a unique contraint');
	})
	.catch((err) => {
		logger.info(`failed with err ${err}`, { err });
	});
