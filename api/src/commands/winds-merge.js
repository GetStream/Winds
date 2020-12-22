import mongoose from 'mongoose';
import ProgressBar from 'progress';

import db from '../utils/db';
import { upsertCollections } from '../utils/collections';
import RSS from '../models/rss';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

process.on('unhandledRejection', (error) => console.error(error.message));

const feedModels = {
	rss: { feed: RSS, content: Article },
	podcast: { feed: Podcast, content: Episode },
};

function estimateSize(content) {
	let size = 2; // {}
	for (const [key, value] of Object.entries(content)) {
		size += Buffer.byteLength(String(key), 'utf8');
		size += Buffer.byteLength(String(value), 'utf8');
		size += 2; // :,
	}
	return size;
}

async function main() {
	await db;

	for (const type of ['rss', 'podcast']) {
		const model = feedModels[type];
		console.log(`synchronising ${type} content`);

		const contentModelName = model.content.collection.collectionName;
		const feedCount = await model.feed.countDocuments();
		const bar = new ProgressBar(
			'[:current / :total] :bar [:percent | :rate records per second]',
			{ total: feedCount },
		);

		let lastFeedId = mongoose.Types.ObjectId('000000000000000000000000');
		let feedsSynced = false;
		while (!feedsSynced) {
			try {
				const feedCursor = model.feed.collection
					.find({
						_id: { $gte: lastFeedId },
					})
					.sort({
						_id: 1,
					})
					.batchSize(32);
				while (await feedCursor.hasNext()) {
					const feed = await feedCursor.next();
					const allowedLanguage = [null, undefined, '', 'eng'].includes(
						feed.language,
					);
					if (!allowedLanguage) {
						bar.tick();
						continue;
					}

					let lastId = mongoose.Types.ObjectId('000000000000000000000000');
					let articlesSynced = false;
					while (!articlesSynced) {
						try {
							const cursor = model.content.collection
								.find({
									_id: { $gte: lastId },
									[type]: feed._id,
								})
								.sort({
									publicationDate: 1,
									_id: 1,
								})
								.limit(1000)
								.batchSize(1000);
							const articleCount = await model.content.countDocuments({
								[type]: feed._id,
							});
							let upserts = [];
							let content = [];
							let currentSize = 0;
							let mostRecentPublicationDate;
							const chunkSize = 1000;
							const sizeLimit = 100 * 1024; // less then 128Kb to leave some space for external data
							while (await cursor.hasNext()) {
								const source = await cursor.next();
								mostRecentPublicationDate = source.publicationDate;

								const item = {
									id: source._id,
									title: source.title,
									likes: source.likes,
									socialScore: source.socialScore,
									description: (source.description || '').substring(
										0,
										240,
									),
									publicationDate: source.publicationDate,
									[type]: source[type],
								};
								//XXX: we overestimate object size by 5-10%
								const size = estimateSize(item);
								const batchIsFull = content.length == chunkSize;
								const batchTooBig = currentSize + size > sizeLimit;
								if (batchIsFull || batchTooBig) {
									upserts.push(
										upsertCollections(contentModelName, content),
									);
									content = [];
									currentSize = 0;
								}
								if (upserts.length && upserts.length % 128 === 0) {
									await Promise.all([
										...upserts,
										// sleep(800)
									]);
									upserts = [];
								}

								currentSize += size;
								content.push(item);
								lastId = item.id;
							}

							await Promise.all([
								...upserts,
								upsertCollections(contentModelName, content),
								upsertCollections(type, [
									{
										id: feed._id,
										title: feed.title,
										language: feed.language,
										description: (feed.description || '').substring(
											0,
											240,
										),
										articleCount: content.length,
										mostRecentPublicationDate,
									},
								]),
								// sleep(800)
							]);
							bar.tick();
							articlesSynced = true;
						} catch (err) {
							console.error(
								`\n\terror processing content: ${err.message}\nresuming from ${lastId}`,
							);
						}
					}
					lastFeedId = feed._id;
				}

				console.log(`${type} synchronised\n`);
				feedsSynced = true;
			} catch (err) {
				console.error(
					`\n\terror processing feed: ${err.message}\nresuming from ${lastFeedId}`,
				);
			}
		}
	}
}

main()
	.then(() => {
		console.log('\ndone');
		process.exit(0);
	})
	.catch((err) => {
		console.error(`\nfailed with err ${err.stack}`);
		process.exit(1);
	});
