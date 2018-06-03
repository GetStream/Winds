import async from 'async';
import rssFinder from 'rss-finder';
import normalizeUrl from 'normalize-url';
import entities from 'entities';
import validUrl from 'valid-url';

import User from '../models/user';
import RSS from '../models/rss';

import personalization from '../utils/personalization';
import logger from '../utils/logger';
import moment from 'moment';
import search from '../utils/search';
import async_tasks from '../async_tasks';

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

exports.get = async (req, res) => {
	if (req.params.rssId === 'undefined') {
		return res.sendStatus(404);
	}
	let rss = await RSS.findById(req.params.rssId).exec();
	if (!rss) {
		return res.sendStatus(404);
	}
	res.json(rss);
};

exports.post = async (req, res) => {
	const data = req.body || {};

	if (!data.feedUrl || !validUrl.isUri(normalizeUrl(data.feedUrl))) {
		return res.status(400).send('Please provide a valid RSS URL.');
	}

	let foundRSS = await rssFinder(normalizeUrl(data.feedUrl));

	if (!foundRSS.feedUrls.length) {
		return res.status(404).send('We couldn\'t find any feeds for that RSS feed URL :(');
	}

	let insertedFeeds = [];

	for (var feed of foundRSS.feedUrls) {
		let feedTitle = feed.title;
		if (feedTitle.toLowerCase() === 'rss') {
			feedTitle = foundRSS.site.title;
		}
		let rss = await RSS.findOneAndUpdate(
			{feedUrl: feed.url},
			{
				categories: 'RSS',
				description: entities.decodeHTML(feed.title),
				feedUrl: feed.url,
				images: {
					favicon: foundRSS.site.favicon,
				},
				lastScraped: moment().format(),
				title: entities.decodeHTML(feedTitle),
				url: foundRSS.site.url,
				valid: true,
			},
			{
				new: true,
				rawResult: true,
				upsert: true,
			},
		);
		if (rss.lastErrorObject.upserted) {
			insertedFeeds.push(rss.value);
		}
	}

	insertedFeeds.map(async f => {
		await search(f.searchDocument());
	});

	insertedFeeds.map(async f => {
		await async_tasks.RssQueueAdd(
			{
				rss: f._id,
				url: f.feedUrl,
			},
			{
				priority: 1,
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
	});

	res.status(201);
	res.json(insertedFeeds);
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
