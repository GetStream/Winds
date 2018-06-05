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
		await asyncTasks.RssQueueAdd(
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

exports.put = async (req, res) => {
	if (!req.User.admin) {
		return res.status(403).send();
	}
	if (!req.params.rssId) {
		return res.status(401).send();
	}
	let rss = await RSS.findByIdAndUpdate(
		{
			_id: req.params.rssId,
		},
		req.body,
		{new: true},
	);
	if (!rss) {
		return res.sendStatus(404);
	}
	res.json(rss);
};
