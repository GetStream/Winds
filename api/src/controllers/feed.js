import stream from 'getstream';
import async from 'async';

import Share from '../models/share';
import Article from '../models/article';
import Episode from '../models/episode';
import Like from '../models/like';

import config from '../config';
import logger from '../utils/logger';

import { getStreamClient } from '../utils/stream';

async function getUserFeed(req, res) {
	const params = req.params || {};
	const query = req.query || {};

	try {
		const shares = await Share.find({
			user: params.userId,
			flags: { $lte: 5 },
		}).sort({ createdAt: 'desc' });

		const enriched = await Promise.all(
			shares.map(async share => {
				const like = await Like.findOne({
					share: share._id,
					user: params.userId,
				}).lean();
				return Object.assign(share.toObject(), { liked: !!like, type: 'share' });
			}),
		);

		res.json(enriched);
	} catch (err) {
		logger.error({ err });
		res.status(422).send(err.errors);
	}
}

async function getTimelineFeed(req, res) {
	const params = req.params || {};
	const query = req.query || {};
	const shares = [];
	const episodes = [];
	const articles = [];

	try {
		const activities = await getStreamClient()
			.feed('timeline', params.userId)
			.get({ limit: 10 });

		try {
			for (const activity of activities.results) {
				const id = activity.foreign_id.split(':')[1];
				const collection = activity.foreign_id.split(':')[0];

				if (collection === 'shares') {
					const share = await Share.findById(id);
					if (!share) continue;

					const like = await Like.findOne({
						share: share._id,
						user: params.userId,
					}).lean();
					shares.push(
						Object.assign(share.toObject(), { liked: !!like, type: 'share' }),
					);
				} else if (collection === 'articles') {
					const article = await Article.findById(id);
					if (!article) continue;

					articles.push(Object.assign(article.toObject(), { type: 'article' }));
				} else if (collection === 'episodes') {
					const episode = await Article.findById(id);
					if (!episode) continue;

					episodes.push(Object.assign(episode.toObject(), { type: 'article' }));
				}
			}
		} catch (err) {
			logger.error({ err });
			return res.status(422).send(err.errors);
		}

		const timeline = shares
			.concat(articles)
			.concat(episodes)
			.sort((a, b) => {
				return b.createdAt - a.createdAt;
			});

		res.json(timeline);
	} catch (err) {
		logger.error({ err });
		res.status(500).send(err);
	}
}

async function getContentFeed(req, res, type, model) {
	const params = req.params || {};
	const query = req.query || {};
	const limit = query.per_page || 10;
	const offset = query.page * limit || 0;
	const response = await getStreamClient()
		.feed(`user_${type}`, params.userId)
		.get({ limit, offset });
	let articleIDs = response.results.map(r => {
		return r.foreign_id.split(':')[1];
	});
	let articles = await model.find({ _id: { $in: articleIDs } });
	let articleLookup = {};
	for (let a of articles) {
		articleLookup[a._id] = a;
	}
	let sortedArticles = [];
	for (let r of response.results) {
		let articleID = r.foreign_id.split(':')[1];
		let article = articleLookup[articleID];
		if (!article) {
			logger.error(
				`Failed to load article ${articleID} specified in feed user_${type}:${
					params.userId
				}`,
			);
			continue;
		}
		sortedArticles.push(article);
	}

	res.json(sortedArticles);
}

exports.get = async (req, res, _) => {
	const params = req.params || {};
	const query = req.query || {};

	if (req.User.id != params.userId) {
		return res.status(404).send('Invalid user id');
	}

	switch (query.type) {
		case 'user':
			return getUserFeed(req, res);
		case 'timeline':
			return getTimelineFeed(req, res);
		case 'article':
			return getContentFeed(req, res, 'article', Article);
		case 'episode':
			return getContentFeed(req, res, 'episode', Episode);
	}
	res.status(400).send(
		'Request must include "type" of user, timeline, article or episode',
	);
};
