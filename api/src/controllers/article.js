import async from 'async';
import Article from '../models/article';
import User from '../models/user';
import Like from '../models/like';
import logger from '../utils/logger';
import events from '../utils/events';
import personalization from '../utils/personalization';

exports.list = (req, res) => {
	const query = req.query || {};

	if (query.type === 'recommended') {
		personalization({
			endpoint: '/winds_article_recommendations',
			userId: req.user.sub,
		})
			.then(data => {
				async.mapLimit(
					data,
					data.length,
					(article, cb) => {
						Article.findOne({ _id: article })
							.then(enriched => {
								if (!enriched) {
									return cb(null);
								}

								Like.findOne({
									article: enriched._id,
									user: req.user.sub,
								})
									.lean()
									.then(like => {
										enriched = enriched.toObject();

										if (like) {
											enriched.liked = true;
										} else {
											enriched.liked = false;
										}

										cb(null, enriched);
									})
									.catch(err => {
										cb(err);
									});
							})
							.catch(err => {
								cb(err);
							});
					},
					(err, results) => {
						if (err) {
							logger.error(err);
							return res.sendStatus(422);
						}

						res.json(
							[].concat(
								...results.filter(val => {
									return val;
								}),
							),
						);
					},
				);
			})
			.catch(err => {
				res.status(503).send(err);
			});
	} else {
		Article.apiQuery(req.query)
			.then(articles => {
				async.mapLimit(
					articles,
					articles.length,
					(article, cb) => {
						Like.findOne({ article: article._id, user: req.user.sub })
							.lean()
							.then(like => {
								article = article.toObject();

								if (like) {
									article.liked = true;
								} else {
									article.liked = false;
								}

								cb(null, article);
							})
							.catch(err => {
								cb(err);
							});
					},
					(err, results) => {
						if (err) {
							logger.error(err);
							return res.status(422).send(err.errors);
						}
						res.json(results.filter(result => result.valid));
					},
				);
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	}
};

exports.get = async (req, res) => {
	if (req.params.articleId === 'undefined') {
		return res.sendStatus(404);
	}

	let user = await User.findById(req.user.sub);
	if (!user) {
		return res.sendStatus(404);
	}

	let article = await Article.findById(req.params.articleId);
	if (!article) {
		return res.sendStatus(404);
	}

	events({
		email: user.email.toLowerCase(),
		engagement: {
			content: {
				foreign_id: `articles:${article._id}`,
			},
			label: 'parse',
		},
		user: user._id,
	}).catch((err) => {
		logger.error(err);
	});

	if (req.query && req.query.type === 'parsed') {
		let parsed = await article.getParsedArticle();
		return res.json(parsed);
	} else {
		res.json(article);
	}
};
