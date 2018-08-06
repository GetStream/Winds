import jwt from 'jsonwebtoken';
import axios from 'axios';

import Podcast from '../models/podcast';
import RSS from '../models/rss';
import Article from '../models/article';
import Episode from '../models/episode';
import { DetectLanguage } from '../parsers/detect-language';
import { getStreamClient } from '../utils/stream';

import config from '../config';
import logger from './logger';

// replaces TrackMetadata and events() calls
export async function upsertCollections(type, content) {
	if (!content.length || config.analyticsDisabled) {
		return;
	}

	const streamClient = getStreamClient();

	try {
		return await streamClient.collections.upsert(type, content);
	} catch (err) {
		logger.error(`failed to update collections with type ${type}`, { err });
	}
}

const feedModels = {
    rss: { feed: RSS, content: Article },
    podcast: { feed: Podcast, content: Episode }
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

export async function sendFeedToCollections(type, feed) {
	const model = feedModels[type];

	if (!feed.language) {
		feed.language = await DetectLanguage(feed.feedUrl);
		await model.feed.findByIdAndUpdate(feed.id, { language: feed.language }, { new: true });
	}
	const content = await model.content.find({ [type]: feed.id })
		.sort({ publicationDate: -1 })
		.limit(1000);

	let mostRecentPublicationDate;
	if (content.length) {
		mostRecentPublicationDate = content[0].publicationDate;
	}

	await upsertCollections(type, [{
		id: feed.id,
		title: feed.title,
		language: feed.language,
		description: feed.description,
		articleCount: content.length,
		mostRecentPublicationDate
	}]);

	const contentModelName = model.content.collection.collectionName;
	const chunkSize = 1000;
	const sizeLimit = 124 * 1024; // a bit less then 128Kb to lease some space for external data
	for (let offset = 0; offset < content.length;) {
		const data = [];
		const limit = Math.min(content.length, offset + chunkSize);
		let currentSize = 0;
		for (; offset < limit; ++offset) {
			const source = content[offset];
			const item = {
				id: source.id,
				title: source.title,
				likes: source.likes,
				socialScore: source.socialScore,
				description: source.description,
				publicationDate: source.publicationDate,
				[type]: feed.id,
			};
			//XXX: we overestimate object size by 5-10%
			const size = estimateSize(item);
			if (currentSize + size > sizeLimit) {
				break;
			}

			currentSize += size;
			data.push(item);
		}

		await upsertCollections(contentModelName, data);
	}
}
