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
export async function upsertCollections(collectionType, publications) {
	if (publications.length && !config.analyticsDisabled) {
		let response;
		let streamClient = getStreamClient();

		try {
			response = await streamClient.collections.upsert(
				collectionType,
				publications,
			);
		} catch (err) {
			logger.error(`failed to update collections with type ${collectionType}`, {
				err,
			});
		}
		return response;
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
}
