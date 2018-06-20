import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';
import Follow from '../models/follow';
import RSS from '../models/rss';
import Pin from '../models/pin';
import User from '../models/user';
import { SendWeeklyEmail, CreateWeeklyEmail } from '../utils/email/send';
import asyncTasks from '../asyncTasks';
import config from '../config';
import jwt from 'jsonwebtoken';
import axios from 'axios';

program.parse(process.argv);

async function getRecommendations(userID, type) {
	return [];
	if (!userID) {
		throw Error('missing user id');
	}
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
		url: `/winds_${type}_recommendations`,
	});
	console.log(response.data);
	let articleIDs = response.data.results.map(result => {
		return result.foreign_id.split(':')[1];
	});
	return articleIDs;
}

async function sendEmail(user, globalContext) {
	let articleIDs = await getRecommendations(user._id, 'article');
	let episodeIDs = await getRecommendations(user._id, 'episode');
	let articles = await Article.find({ _id: { $in: articleIDs } }).lean();
	let episodes = await Episode.find({ _id: { $in: episodeIDs } }).lean();

	let podcastIDs = await getRecommendations(user._id, 'podcast');
	let podcasts = await Podcast.find({ _id: { $in: podcastIDs } }).lean();
	let rssIDs = await getRecommendations(user._id, 'rss');
	let rss = await RSS.find({ _id: { $in: rssIDs } }).lean();

	let userContext = {
		email: user.email,
		articles: articles,
		episodes: episodes,
		user: user,
		podcasts: podcasts,
		rss: rss,
	};
	let context = Object.assign({}, userContext, globalContext);

	let obj = CreateWeeklyEmail(context);
	console.log(obj.html);
}

async function main() {
	logger.info(`time to send article recommendations, \\0/`);

	// prep the data we need for everyone
	let counts = {};
	counts.users = await User.find({}).count();
	counts.articles = await Article.find({}).count();
	counts.episodes = await Episode.find({}).count();
	counts.rss = await RSS.find({}).count();
	counts.podcast = await Podcast.find({}).count();
	let data = { counts };

	let users = await User.find({});
	let enabledUsers = users.filter(u => {
		if (['thierryschellenbach@gmail.com'].includes(u.email)) {
			return true;
		} else if (u.email.indexOf('getstream') != -1) {
			return true;
		}
		return false;
	});
	for (const u of enabledUsers) {
		await sendEmail(u, data);
	}
}

main()
	.then(result => {
		logger.info('all done sending emails');
	})
	.catch(err => {
		logger.info(`failed with err ${err}`, { err });
	});
