import Article from '../models/article';
import { getArticleRecommendations } from '../utils/personalization';
import { trackEngagement } from '../utils/analytics';

import mongoose from 'mongoose';
import logger from '../utils/logger';

exports.list = async (req, res) => {
	const query = req.query || {};

	let articles = [];

	if (query.type === 'recommended') {
		articles = await getArticleRecommendations(req.User);
	} else {
		if (query.rss && !mongoose.Types.ObjectId.isValid(query.rss)) {
			return res.status(400).json({ error: `Invalid RSS id ${query.rss}` });
		}

		articles = await Article.apiQuery(req.query);
	}

	res.json(articles.filter(a => a.valid));
};

exports.get = async (req, res) => {
	let articleId = req.params.articleId;

	if (!mongoose.Types.ObjectId.isValid(articleId)) {
		return res
			.status(400)
			.json({ error: `Resource articleId (${articleId}) is an invalid ObjectId.` });
	}

	let article = await Article.findById(articleId);
	if (!article) {
		return res.status(404).json({ error: 'Resource not found.' });
	}

	if (req.query && req.query.type === 'parsed') {
		let parsed = await article.getParsedArticle();
		await trackEngagement(req.User, {
			label: 'open_article',
			content: { foreign_id: `article:${articleId}` },
		});

		return res.json(parsed);
	}

	res.json(article);
};
