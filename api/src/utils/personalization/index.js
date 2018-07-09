import axios from 'axios';
import jwt from 'jsonwebtoken';
import Article from '../../models/article';
import Podcast from '../../models/podcast';
import RSS from '../../models/rss';
import Episode from '../../models/episode';
import logger from '../../utils/logger';

import config from '../../config';

export function createGlobalToken() {
	const token = jwt.sign(
		{
			action: '*',
			feed_id: '*',
			resource: '*',
			user_id: '*',
		},
		config.stream.apiSecret,
		{ algorithm: 'HS256', noTimestamp: true },
	);
	return token;
}

export async function getRecommendations(userID, type, limit) {
	if (!userID) {
		throw Error('missing user id');
	}

	const token = createGlobalToken();
	const path = `/winds_${type}_recommendations`;
	const params = {
		api_key: config.stream.apiKey,
		user_id: userID,
		limit: limit,
	};

	let response = await axios({
		baseURL: config.stream.baseUrl,
		headers: {
			Authorization: token,
			'Content-Type': 'application/json',
			'Stream-Auth-Type': 'jwt',
		},
		method: 'GET',
		params: params,
		url: path,
	});

	if (response.status != 200) {
		return false;
	}

	let objectIDs = response.data.results.map(result => {
		return result.foreign_id.split(':')[1];
	});

	return objectIDs;
}

export async function getRSSRecommendations(userID, limit = 20) {
	try {
		const ids = await getRecommendations(userID, 'rss', limit);
	} catch (e) {
		return [];
	}

	return RSS.find({ _id: { $in: ids } });
}

export async function getPodcastRecommendations(userID, limit = 20) {
	try {
		const ids = await getRecommendations(userID, 'podcast', limit);
	} catch (e) {
		return [];
	}

	return Podcast.find({ _id: { $in: ids } });
}

export async function getEpisodeRecommendations(userID, limit = 20) {
	let ids = await getRecommendations(userID, 'episode', limit);
	let episodes = await Episode.find({ _id: { $in: ids } });
	if (ids.length != episodes.length) {
		logger.warn(`failed to find some episodes from list ${ids.join(',')}`);
	}
	return episodes;
}

export async function getArticleRecommendations(userID, limit = 20) {
	let ids = await getRecommendations(userID, 'article', limit);
	let articles = await Article.find({ _id: { $in: ids } });
	if (ids.length != articles.length) {
		logger.warn(`failed to find some articles from list ${ids.join(',')}`);
	}
	return articles;
}
