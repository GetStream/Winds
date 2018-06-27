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
	const userId = user._id.toString();

	let articles = [];
	let episodes = [];
	let podcasts = [];
	let rss = [];

	try {
		articles = await personalization.getArticleRecommendations(userId, 5);
		episodes = await personalization.getEpisodeRecommendations(userId, 5);

		let position = 0;

		episodes.map(episode => {
			position++;

			episode.trackingUrl = getStreamClient().createRedirectUrl(
				episode.getUrl(),
				user._id,
				[
					{
						content: `episode:${episode._id}`,
						label: 'click',
						user_data: user._id,
						position: position,
						location: 'email',
					},
				],
			);
		});

		articles.map((article, index) => {
			position++;

			article.trackingUrl = getStreamClient().createRedirectUrl(
				article.getUrl(),
				user._id,
				[
					{
						content: `article:${article._id}`,
						label: 'click',
						user_data: user._id,
						position: position,
						location: 'email',
					},
				],
			);
		});
	} catch (e) {
		logger.info(`article recommendations failed for ${userId}`);

		if (e.request) {
			logger.warn(
				`Failed with code ${e.response.status} for path  ${e.request.path}`,
			);
		} else {
			logger.warn(`error ${e}`);
		}
	}
	try {
		podcasts = await personalization.getPodcastRecommendations(userId, 3);
		rss = await personalization.getRSSRecommendations(userId, 3);
	} catch (e) {
		logger.info(`Follow suggestions failed for ${userId}`);
	}

	let userContext = {
		email: user.email,
		articles,
		episodes,
		user,
		podcasts,
		rss,
	};

	return userContext;
}
