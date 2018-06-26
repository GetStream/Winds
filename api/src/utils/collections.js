import Podcast from '../models/podcast';
import RSS from '../models/rss';
import Article from '../models/article';
import Episode from '../models/episode';
import { DetectLanguage } from '../parsers/detect-language';
import { getStreamClient } from '../utils/stream';

import config from '../config';
import jwt from 'jsonwebtoken';
import axios from 'axios';

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

export async function sendPodcastToCollections(podcast) {
	if (!podcast.language) {
		podcast.language = await DetectLanguage(podcast.feedUrl);
		await Podcast.findByIdAndUpdate(
			podcast.id,
			{ language: podcast.language },
			{ new: true },
		);
	}
	let episodes = await Episode.find({
		podcast: podcast.id,
	})
		.sort({ publicationDate: -1 })
		.limit(1000);

	let mostRecentPublicationDate;
	if (episodes.length) {
		mostRecentPublicationDate = episodes[0].publicationDate;
	}

	let collections = [
		{
			id: podcast.id,
			articleCount: episodes.length,
			description: podcast.description,
			language: podcast.language,
			mostRecentPublicationDate: mostRecentPublicationDate,
			title: podcast.title,
		},
	];

	await upsertCollections('podcast', collections);
}

export async function sendRssFeedToCollections(rssFeed) {
	if (!rssFeed.language) {
		rssFeed.language = await DetectLanguage(rssFeed.feedUrl);
		await RSS.findByIdAndUpdate(
			rssFeed.id,
			{ language: rssFeed.language },
			{ new: true },
		);
	}

	let articles = await Article.find({
		rss: rssFeed.id,
	})
		.sort({ publicationDate: -1 })
		.limit(1000);
	let mostRecentPublicationDate;
	if (articles.length) {
		mostRecentPublicationDate = articles[0].publicationDate;
	}

	let collections = [
		{
			id: rssFeed.id,
			articleCount: articles.length,
			description: rssFeed.description,
			language: rssFeed.language,
			mostRecentPublicationDate: mostRecentPublicationDate,
			title: rssFeed.title,
		},
	];

	await upsertCollections('rss', collections);
}
