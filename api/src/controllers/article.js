import Article from '../models/article';
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
	
	if (req.query && req.query.type === 'parsed') {
		let parsed = await article.getParsedArticle();
		res.json(parsed);
	} else {
		res.json(article);
	}
};
