import rssFinder from 'rss-finder';
import normalizeUrl from 'normalize-url';
import entities from 'entities';
import validUrl from 'valid-url';

import RSS from '../models/rss';

import personalization from '../utils/personalization';
import moment from 'moment';
import search from '../utils/search';
import asyncTasks from '../asyncTasks';

exports.list = async (req, res) => {
	const query = req.query || {};
	let feeds = [];

	if (query.type === 'recommended') {
		let recommendedRssIds = await personalization({
			endpoint: '/winds_rss_recommendations', userId: req.user.sub,
		});
		feeds = await RSS.find({_id: {$in: recommendedRssIds}});
	} else {
		feeds = await RSS.apiQuery(req.query);
	}

	res.json(feeds);
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
		return res.status(400).json({ error: 'Please provide a valid RSS URL.' });
	}

	let foundRSS = await rssFinder(normalizeUrl(data.feedUrl));

	if (!foundRSS.feedUrls.length) {
		return res.status(404).json({ error: 'We couldn\'t find any feeds for that RSS feed URL :(' });
	}

	let insertedFeeds = [];
	let feeds = [];

	for (let feed of foundRSS.feedUrls.slice(0,10)) {
		let feedTitle = feed.title;
		if (feedTitle.toLowerCase() === 'rss') {
			feedTitle = foundRSS.site.title;
		}
		let feedUrl = normalizeUrl(feed.url)
		if (!validUrl.isWebUri(feedUrl)) {
			continue
		}
		let rss
		rss = await RSS.findOne({feedUrl: feedUrl})
		// don't update featured RSS feeds since that ends up removing images etc
		if (!rss || (rss && !rss.featured)) {
			let response = await RSS.findOneAndUpdate(
				{feedUrl: feedUrl},
				{
					categories: 'RSS',
					description: entities.decodeHTML(feed.title),
					feedUrl: feedUrl,
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

			rss = response.value
			if (response.lastErrorObject.upserted) {
				insertedFeeds.push(rss);
			}
		}
		feeds.push(rss)
	}

	let promises = []
	insertedFeeds.map(f => {
		promises.push(search(f.searchDocument()))
		let rssScrapingPromise = asyncTasks.RssQueueAdd(
			{
				rss: f._id,
				url: f.feedUrl,
			},
			{
				priority: 1,
				removeOnComplete: true,
				removeOnFail: true,
			},
		)
		promises.push(rssScrapingPromise)
		if (!f.images.og && f.url) {
			let ogPromise = asyncTasks.OgQueueAdd(
				{
					url: f.url,
					type: 'rss',
				},
				{
					removeOnComplete: true,
					removeOnFail: true,
				},
			);
			promises.push(ogPromise)
		}
	});
	await Promise.all(promises)

	res.status(201);
	res.json(feeds);
};

exports.put = async (req, res) => {
	if (!req.User.admin) {
		return res.status(403).json({ error: 'You must be an admin to perform this action.' });
	}

	if (!req.params.rssId) {
		return res.status(401).json({ error: 'You must provide a valid RSS ID to perform this action' });
	}

	let rss = await RSS.findByIdAndUpdate(
		{
			_id: req.params.rssId,
		},
		req.body,
		{new: true},
	);

	if (!rss) {
		return res.status(404).json({ error: `Can't find RSS feed with id ${req.params.rssId}` });
	}

	res.json(rss);
};
