import Article from '../models/article';
import logger from '../utils/logger';
import events from '../utils/events';
import personalization from '../utils/personalization';

exports.list = async (req, res) => {
	const query = req.query || {};
	let articles = [];
	if (query.type === 'recommended') {
		let articleIds = await personalization({
			endpoint: '/winds_article_recommendations',
			userId: req.user.sub,
		});
		articles = await Article.find({ _id: {$in: articleIds}});
	} else {
		articles = await Article.apiQuery(req.query);
	}
	res.json(articles.filter(a => a.valid));
};

exports.get = async (req, res) => {
	if (req.params.articleId === 'undefined') {
		return res.sendStatus(404);
	}

	let article = await Article.findById(req.params.articleId);
	if (!article) {
		return res.sendStatus(404);
	}

	events({
		email: req.User.email.toLowerCase(),
		engagement: {
			content: {
				foreign_id: `articles:${article._id}`,
			},
			label: 'parse',
		},
		user: req.User._id,
	}).catch((err) => {
		logger.error(err);
	});

	if (req.query && req.query.type === 'parsed') {
		let parsed = await article.getParsedArticle();
		res.json(parsed);
	} else {
		res.json(article);
	}
};
