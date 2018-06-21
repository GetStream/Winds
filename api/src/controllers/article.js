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
	let articleID = req.params.articleId;

	if (!mongoose.Types.ObjectId.isValid(articleID)) {
		return res.status(400).json({ error: `Article ID ${articleID} is invalid` });
	}

	let article = await Article.findById(articleID);
	if (!article) {
		return res.status(404).json({ error: `Can't find article with id ${articleID}` });
	}

	if (req.query && req.query.type === 'parsed') {
		let parsed = await article.getParsedArticle();
		await trackEngagement(req.User, {
			label: 'open_article',
			content: { foreign_id: `article:${articleID}` },
		});

		res.json(parsed);
	} else {
		res.json(article);
	}
};
