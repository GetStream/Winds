import Podcast from '../models/podcast';
import RSS from '../models/rss';
import Article from '../models/article';
import Episode from '../models/episode';
import { DetectLanguage } from '../parsers/detect-language';
import config from '../config';

// replaces TrackMetadata and events() calls
export async function upsertCollections(collections) {
	// Collection in the format {'user:1': {userdatahere}}
	// TODO: this should be part of the stream-js library
	if (Object.keys(collections).length && !config.analyticsDisabled) {
		const token = jwt.sign(
			{
				action: '*',
				resource: '*',
				user_id: '*',
			},
			config.stream.apiSecret,
			{ algorithm: 'HS256', noTimestamp: true },
		);
		return await axios({
			data: collections,
			headers: {
				Authorization: token,
				'stream-auth-type': 'jwt',
			},
			method: 'POST',
			params: {
				api_key: config.stream.apiKey,
			},
			url: `${config.stream.baseUrl}/winds_meta/`,
		});
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

	let collections = {
		[`podcast:${podcast.id}`]: {
			articleCount: episodes.length,
			description: podcast.description,
			language: podcast.language,
			mostRecentPublicationDate: mostRecentPublicationDate,
			title: podcast.title,
		},
	};

	await upsertCollections(collections);
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

	let collections = {
		[`rss:${rssFeed.id}`]: {
			articleCount: articles.length,
			description: rssFeed.description,
			language: rssFeed.language,
			mostRecentPublicationDate: mostRecentPublicationDate,
			title: rssFeed.title,
		},
	};

	await upsertCollections(collections);
}
