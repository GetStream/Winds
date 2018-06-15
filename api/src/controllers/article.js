import Article from '../models/article';
import personalization from '../utils/personalization';
import mongoose from 'mongoose';
import logger from '../utils/logger';


exports.list = async (req, res) => {
	const query = req.query || {};
	let articles = [];

	if (query.type === 'recommended') {
		const articleIds = await personalization({
			endpoint: '/winds_article_recommendations',
			userId: req.user.sub,
		});

		for (let articleId of articleIds) {
			if (!mongoose.Types.ObjectId.isValid(articleId)) {
				logger.error(`Personalization for ${req.user.sub} returned an invalid articleID ${articleID}.`)
				return res.status(500).json({ error: `Failed to load personalized follow suggestions.` });
			}
		}

		articles = await Article.find({ _id: { $in: articleIds }});
	} else {
		if (query.rss && !mongoose.Types.ObjectId.isValid(query.rss)) {
			return res.status(400).json({ error: `Invalid RSS id ${query.rss}` });
		}
		articles = await Article.apiQuery(req.query);
	}

	res.json(articles.filter(a => a.valid));
};

exports.get = async (req, res) => {
	const articleId = req.params.articleId;

	if (!mongoose.Types.ObjectId.isValid(articleId)) {
		return res.status(400).json({ error: `Article ID ${articleId} is invalid.` });
	}

	try {
		const article = await Article.findById(articleId);

		if (!article) {
			return res.status(404).json({ error: `Can't find article with id ${articleId}.` });
		}

		if (req.query && req.query.type === 'parsed') {
			let parsed = await article.getParsedArticle();
			res.json(parsed);
		} else {
			res.json(article);
		}
	} catch(e) {
		return res.status(400).json({ error: `Article ID ${articleId} is invalid.` });
	}
};
