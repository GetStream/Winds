import Article from '../models/article';
import Episode from '../models/episode';

import config from '../config';
import logger from '../utils/logger';

import { getStreamClient } from '../utils/stream';

async function getContentFeed(req, res, type, model) {
	const limit = req.query.per_page || 10;
	const offset = req.query.page * limit || 0;

	const response = await getStreamClient()
		.feed(`user_${type}`, req.params.userId)
		.get({ limit, offset });

	let articleIDs = response.results.map((r) => {
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
				`Failed to load article ${articleID} specified in feed user_${type}:${req.params.userId}`,
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
		case 'article':
			return getContentFeed(req, res, 'article', Article);
		case 'episode':
			return getContentFeed(req, res, 'episode', Episode);
	}
	res.status(400).send(
		'Request must include "type" of user, timeline, article or episode',
	);
};
