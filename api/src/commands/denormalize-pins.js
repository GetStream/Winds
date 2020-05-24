import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';
import Follow from '../models/follow';
import RSS from '../models/rss';
import Pin from '../models/pin';
import User from '../models/user';

import asyncTasks from '../asyncTasks';

program.parse(process.argv);

async function main() {
	logger.info(`time to denormalize those pin urls, \\0/`);

	// denormalize the pin urls
	let pins = await Pin.find({});
	let counts = { denormalized: 0, normalized: 0, missing: 0, brokenref: 0 };
	for (let p of pins) {
		let url = (p.article && p.article.url) || (p.episode && p.episode.url);
		if (!p.url && p.user) {
			if (url) {
				p.url = url;
				await p.save();
				counts.denormalized += 1;
			} else {
				if (p._id) {
					await Pin.deleteOne({ _id: p._id });
				}
				counts.brokenref += 1;
			}
		}
		logger.info(`pin url ${p.url} is now denormalized`);
	}

	// restore the relation for pins where we miss a matching schema
	pins = await Pin.find({}).lean();
	for (let p of pins) {
		let type = p.article ? 'rss' : 'podcast';
		let postType = type == 'rss' ? 'article' : 'episode';
		let schema = type == 'rss' ? Article : Episode;
		let postID = p.article || p.episode;
		let instance = await schema.findOne({ _id: postID });

		if (!instance && p.url) {
			logger.info(`restoring relation for pin with url ${p.url}`);
			let newInstance = await schema.findOne({ url: p.url }).lean();
			if (newInstance) {
				let data = {};
				data[postType] = newInstance._id;
				let result = await Pin.updateOne({ _id: p._id }, data);
				logger.info(
					`found a new instance for ${p._id}: ${p.url} with id ${newInstance._id}`,
				);
				counts.normalized += 1;
			} else {
				if (p._id) {
					await Pin.deleteOne({ _id: p._id });
				}
				logger.info(`couldnt find a new instance :(`);
				counts.missing += 1;
			}
		}
	}
	let c = JSON.stringify(counts);
	logger.info(`completed, counts are ${c}`);
}

main()
	.then((result) => {
		logger.info('completed it all, open the test page to see queue status');
	})
	.catch((err) => {
		logger.info(`failed with err ${err}`, { err });
	});
