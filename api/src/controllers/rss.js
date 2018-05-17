import Queue from 'bull';
import async from 'async';
import rssFinder from 'rss-finder';
import normalizeUrl from 'normalize-url';
import entities from 'entities';
import validUrl from 'valid-url';

import User from '../models/user';
import RSS from '../models/rss';

import personalization from '../utils/personalization';
import search from '../utils/search';
import logger from '../utils/logger';
import moment from 'moment';
import config from '../config';

const rssQueue = new Queue('rss', config.cache.uri);

exports.list = (req, res) => {
	const query = req.query || {};

	if (query.type === 'recommended') {
		personalization({ endpoint: '/winds_rss_recommendations', userId: req.user.sub })
			.then(data => {
				async.mapLimit(
					data,
					data.length,
					(rss, cb) => {
						RSS.findOne({ _id: rss })
							.then(enriched => {
								if (!enriched) {
									return cb(null);
								}
								cb(null, enriched);
							})
							.catch(err => {
								cb(err);
							});
					},
					(err, results) => {
						if (err) {
							logger.error(err);
							return res.sendStatus(422).send(err);
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
				logger.error(err.message);
				res.json([]);
			});
	} else {
		RSS.apiQuery(req.query)
			.then(rss => {
				res.json(rss);
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	}
};

exports.get = (req, res) => {
	if (req.params.rssId === 'undefined') {
		return res.sendStatus(404);
	}

	let query = req.query || {};
	let params = req.params || {};

	if (query.type === 'count') {
		RSS.count({ _id: params.rssId })
			.then(count => {
				if (!count) {
					return res.sendStatus(404);
				}

				res.json({ total: count });
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	} else {
		RSS.findById(params.rssId)
			.then(rss => {
				if (!rss) {
					return res.sendStatus(404);
				}

				res.json(rss);
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	}
};

exports.post = (req, res) => {
	const data = req.body || {};

	if (!data.feedUrl || !validUrl.isUri(normalizeUrl(data.feedUrl))) {
		return res.status(400).send('Please provide a valid RSS URL.');
	}

	rssFinder(normalizeUrl(data.feedUrl))
		.then(feeds => {
			if (!feeds.feedUrls.length) {
				return res
					.status(404)
					.send("We couldn't find any feeds for that RSS feed URL :(");
			}

			async.mapLimit(
				feeds.feedUrls,
				feeds.feedUrls.length,
				(feed, cb) => {
					let feedTitle = feed.title;

					if (feedTitle.toLowerCase() === 'rss') {
						feedTitle = feeds.site.title;
					}

					RSS.findOneAndUpdate(
						{ feedUrl: feed.url },
						{
							categories: 'RSS',
							description: entities.decodeHTML(feed.title),
							featured: false,
							feedUrl: feed.url,
							images: {
								favicon: feeds.site.favicon,
							},
							lastScraped: moment().format(),
							title: entities.decodeHTML(feedTitle),
							url: feeds.site.url,
							valid: true,
						},
						{
							new: true,
							rawResult: true,
							upsert: true,
						},
					)
						.then(rss => {
							if (rss.lastErrorObject.updatedExisting) {
								cb(null, rss.value);
							} else {
								search({
									_id: rss.value._id,
									categories: 'RSS',
									description: rss.value.title,
									image: rss.value.favicon,
									public: true,
									publicationDate: rss.value.publicationDate,
									title: rss.value.title,
									type: 'rss',
								})
									.then(() => {
										return rssQueue.add(
											{
												rss: rss.value._id,
												url: rss.value.feedUrl,
											},
											{
												priority: 1,
												removeOnComplete: true,
												removeOnFail: true,
											},
										);
									})
									.then(() => {
										cb(null, rss.value);
									})
									.catch(err => {
										cb(err);
									});
							}
						})
						.catch(err => {
							cb(err);
						});
				},
				(err, results) => {
					if (err) {
						return;
					}

					res.json(results);
				},
			);
		})
		.catch(() => {
			res.sendStatus(500);
		});
};

exports.put = (req, res) => {
	User.findById(req.user.sub)
		.then(user => {
			if (!user.admin) {
				return res.status(401).send();
			} else {
				const data = req.body || {};
				let opts = {
					new: true,
				};

				RSS.findByIdAndUpdate(
					{
						_id: req.params.rssId,
					},
					data,
					opts,
				).then(rss => {
					if (!rss) {
						return res.sendStatus(404);
					}
					res.json(rss);
				});
			}
		})
		.catch(err => {
			logger.error(err);
			res.status(422).send(err.errors);
		});
};
