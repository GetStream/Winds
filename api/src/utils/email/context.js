import * as personalization from '../personalization';
import Podcast from '../../models/podcast';
import Article from '../../models/article';
import Episode from '../../models/episode';
import Follow from '../../models/follow';
import RSS from '../../models/rss';
import Pin from '../../models/pin';
import User from '../../models/user';

import logger from '../../utils/logger';


export async function weeklyContextGlobal() {
	let counts = {};
	counts.users = await User.find({}).count();
	counts.articles = await Article.find({}).count();
	counts.episodes = await Episode.find({}).count();
	counts.rss = await RSS.find({}).count();
	counts.podcast = await Podcast.find({}).count();
	let data = { counts };
	return data;
}

export async function weeklyContextUser(user) {
	const userID = user._id.toString();
	let articles = [];
	let episodes = [];
	let podcasts = [];

	let rss = [];

	try {
		articles = await personalization.getArticleRecommendations(userID, 5);
		episodes = await personalization.getEpisodeRecommendations(userID, 5);
	} catch (e) {
		logger.info(`article recommendations failed for ${userID}`);
		if (e.request) {
			logger.warn(
				`failed with code ${e.response.status} for path  ${e.request.path}`,
			);
		} else {
			logger.warn(`error ${e}`);
		}
	}
	try {
		podcasts = await personalization.getPodcastRecommendations(userID, 3);

		rss = await personalization.getRSSRecommendations(userID, 3);
	} catch (e) {
		logger.info(`follow suggestions failed for ${userID}`);
	}

	let userContext = {
		email: user.email,
		articles: articles,
		episodes: episodes,
		user: user,
		podcasts: podcasts,
		rss: rss,
	};
	return userContext;
}
