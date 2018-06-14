import Article from '../models/article';
import personalization from '../utils/personalization';
import mongoose from 'mongoose';
import logger from '../utils/logger';


exports.list = async (req, res) => {
	const query = req.query || {};
	let articles = [];
	if (query.type === 'recommended') {
		let articleIDs = await personalization({
			endpoint: '/winds_article_recommendations',
			userId: req.user.sub,
		});
		// handle failure from the article personalization endpoint gracefully
		for (let articleID of articleIDs) {
			if (!mongoose.Types.ObjectId.isValid(articleID)) {
				logger.error(`Personalization for ${req.user.sub} returned an invalid articleID ${articleID}`)
				return res.status(500).json({ error: `Failed to load personalized follow suggestions` });
			}
		}
		articles = await Article.find({ _id: {$in: articleIDs}});
	} else {
		if (req.rss && !mongoose.Types.ObjectId.isValid(rss)) {
			return res.status(400).json({ error: `Invalid RSS id ${req.rss}` });
		}
		articles = await Article.apiQuery(req.query);
	}

	res.json(articles.filter(a => a.valid));
};

exports.get = async (req, res) => {
	let articleID = req.params.articleId

	if (!mongoose.Types.ObjectId.isValid(articleID)) {
		return res.status(400).json({ error: `Article ID ${articleID} is invalid` });
	}

	let article = await Article.findById(articleID);
	if (!article) {
		return res.status(404).json({ error: `Can't find article with id ${articleID}` });
	}

	if (req.query && req.query.type === 'parsed') {
		let parsed = await article.getParsedArticle();

		res.json(parsed);
	} else {
		res.json(article);
	}
};
