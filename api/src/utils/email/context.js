import * as personalization from '../personalization';
import Podcast from '../../models/podcast';
import Article from '../../models/article';
import Episode from '../../models/episode';
import Follow from '../../models/follow';
import RSS from '../../models/rss';
import Pin from '../../models/pin';
import User from '../../models/user';

import logger from '../../utils/logger';
import { getStreamClient } from '../../utils/stream';

export async function dailyContextGlobal() {
	//TODO: actually implement this
	return await weeklyContextGlobal();
}

export async function weeklyContextGlobal() {
	const [rss, users, podcast, episodes, articles] = await Promise.all([
		RSS.find({}).estimatedDocumentCount(),
		User.find({}).estimatedDocumentCount(),
		Podcast.find({}).estimatedDocumentCount(),
		Episode.find({}).estimatedDocumentCount(),
		Article.find({}).estimatedDocumentCount(),
	]);

	return { counts: { rss, users, podcast, episodes, articles } };
}

export async function dailyContextUser(user) {
	//TODO: actually implement this
	return await weeklyContextUser(user);
}

function getRedirectUrl(url, id, userID, position) {
	return getStreamClient().createRedirectUrl(url, userID, [{
		content: id,
		label: 'click',
		user_data: userID,
		location: 'email',
		position,
	}]);
}

export async function weeklyContextUser(user) {
	const userID = user._id.toString();

	let articles = [];
	let episodes = [];
	try {
		[articles, episodes] = await Promise.all([
			personalization.getArticleRecommendations(userID, 5),
			personalization.getEpisodeRecommendations(userID, 5),
		]);

		let position = 0;
		for (const episode of episodes) {
			episode.trackingUrl = getRedirectUrl(episode.getUrl(), `episode:${episode._id}`, user._id, ++position);
		}
		for (const article of articles) {
			article.trackingUrl = getRedirectUrl(article.getUrl(), `article:${article._id}`, user._id, ++position);
		}
	} catch (e) {
		logger.warn(`Content recommendations failed for ${userID}: ${e.stack}`);

		if (e.request) {
			logger.warn(`Failed with code ${e.response.status} for path ${e.request.path}`);
		}
	}

	let podcasts = [];
	let rss = [];
	try {
		[podcasts, rss] = await Promise.all([
			personalization.getPodcastRecommendations(userID, 3),
			personalization.getRSSRecommendations(userID, 3),
		]);
	} catch (e) {
		logger.warn(`Follow suggestions failed for ${userID}: ${e.stack}`);
	}

	return {
		email: user.email,
		articles,
		episodes,
		user,
		podcasts,
		rss,
	};
}
