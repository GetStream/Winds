import axios from 'axios';
import jwt from 'jsonwebtoken';
import Article from '../../models/article';
import Podcast from '../../models/podcast';
import RSS from '../../models/rss';
import Episode from '../../models/episode';

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

export async function getRecommendations(userID, type) {
	if (!userID) {
		throw Error('missing user id');
	}
	const token = createGlobalToken();
	const path = `/winds_${type}_recommendations`;

	let response = await axios({
		baseURL: config.stream.baseUrl,
		headers: {
			Authorization: token,
			'Content-Type': 'application/json',
			'Stream-Auth-Type': 'jwt',
		},
		method: 'GET',
		params: {
			api_key: config.stream.apiKey,
			user_id: userID,
		},
		url: path,
	});
	let objectIDs = response.data.results.map(result => {
		return result.foreign_id.split(':')[1];
	});
	return objectIDs;
}

export async function getRSSRecommendations(userID) {
	let ids = await getRecommendations(userID, 'rss');
	return RSS.find({ _id: { $in: ids } }).lean();
}

export async function getArticleRecommendations(userID) {
	let ids = await getRecommendations(userID, 'article');
	return Article.find({ _id: { $in: ids } }).lean();
}

export async function getPodcastRecommendations(userID) {
	let ids = await getRecommendations(userID, 'podcast');
	return Podcast.find({ _id: { $in: ids } }).lean();
}

export async function getEpisodeRecommendations(userID) {
	let ids = await getRecommendations(userID, 'episode');
	return Episode.find({ _id: { $in: ids } }).lean();
}
