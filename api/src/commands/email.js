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
import * as personalization from '../utils/personalization';

program.option('--send', 'Actually send the email').parse(process.argv);

async function sendEmail(user, globalContext) {
	// TODO:
	// - make the sendEmail prod/send email configurable
	// - email click tracking
	const userID = user._id.toString();
	let articles = [];
	let episodes = [];
	let podcasts = [];
	let a = await Article.findOne({})

	let rss = [];

	try {
		articles = await personalization.getArticleRecommendations(userID, 5);
		episodes = await personalization.getEpisodeRecommendations(userID, 5);
	} catch (e) {
		logger.info(`article recommendations failed for ${userID}`);
		if (e.request) {
			logger.warn(`failed with code ${e.response.status} for path  ${e.request.path}`)
		} else {
			logger.warn(`error ${e}`)
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
	let context = Object.assign({}, userContext, globalContext);

	let obj = CreateWeeklyEmail(context);
	logger.info(`email ${obj.html}`);
	if (program.send) {
		logger.info(`sending email, yee to user ${user.email}`);
		SendWeeklyEmail(context);
	}
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
		return u.weeklyEmail || u.admin;
	});
	logger.info(`going to email ${enabledUsers.length} users`);
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
