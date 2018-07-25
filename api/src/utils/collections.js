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
	const chunkSize = 250;

	for (let offset = 0; offset < content.length; offset += chunkSize) {
		const limit = Math.min(content.length, offset + chunkSize);
		const data = content.slice(offset, limit).map(c => {
			return {
				id: c.id,
				title: c.title,
				likes: c.likes,
				socialScore: c.socialScore,
				description: c.description,
				publicationDate: c.publicationDate,
				[type]: feed.id,
			};
		});

		await upsertCollections(contentModelName, data);
	}
}
