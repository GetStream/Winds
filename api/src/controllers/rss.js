import mongoose from 'mongoose';
import moment from 'moment';
import normalizeUrl from 'normalize-url';
import entities from 'entities';

import RSS from '../models/rss';

import { discoverRSS } from '../parsers/discovery';

import search from '../utils/search';
import { isBlockedURLs } from '../utils/blockedURLs';
import { isURL } from '../utils/validation';
import { RssQueueAdd, OgQueueAdd } from '../asyncTasks';
import { getRSSRecommendations } from '../utils/personalization';

exports.list = async (req, res) => {
	const query = req.query || {};
	let rss;

	if (query.type === 'recommended') {
		rss = await getRSSRecommendations(req.User._id.toString(), 7);
	} else {
		rss = await RSS.apiQuery(req.query);
	}

	res.json(rss);
};

exports.get = async (req, res) => {
	const rssId = req.params.rssId;

	if (!mongoose.Types.ObjectId.isValid(rssId)) {
		return res.status(422).json({ error: `RSS ID ${rssId} is invalid.` });
	}

	let rss = await RSS.findById(rssId).exec();
	if (!rss) {
		return res.sendStatus(404);
	}

	res.json(rss.serialize());
};

exports.post = async (req, res) => {
	const data = req.body || {};
	let normalizedUrl;
	// TODO: refactor this url check in utitlies
	try {
		normalizedUrl = normalizeUrl(data.feedUrl);
	} catch (e) {
		return res.status(400).json({ error: 'Please provide a valid RSS URL.' });
	}
	if (!data.feedUrl || !isURL(normalizedUrl)) {
		return res.status(400).json({ error: 'Please provide a valid RSS URL.' });
	}

	if (isBlockedURLs(data.feedUrl)) {
		return res.status(400).json({ error: 'This feed can not be added.' });
	}

	let foundRSS = await discoverRSS(normalizeUrl(data.feedUrl));

	if (!foundRSS.feedUrls.length) {
		return res
			.status(404)
			.json({ error: "We couldn't find any feeds for that RSS feed URL :(" });
	}

	let insertedFeeds = [];
	let feeds = [];

	for (let feed of foundRSS.feedUrls.slice(0, 10)) {
		let feedTitle = feed.title;
		if (!feedTitle) {
			continue;
		}

		if (feedTitle.toLowerCase() === 'rss') {
			feedTitle = foundRSS.site.title;
		}

		let feedUrl = normalizeUrl(feed.url);
		if (!isURL(feedUrl)) {
			continue;
		}

		let rss = await RSS.findOne({ feedUrl: feedUrl });
		const limit = moment().subtract(30, 'seconds');
		// don't update featured RSS feeds since that ends up removing images etc
		if (!rss || (!rss.featured && limit.isAfter(rss.lastScraped))) {
			let response = await RSS.findOneAndUpdate(
				{ feedUrl: feedUrl },
				{
					categories: 'RSS',
					description: (entities.decodeHTML(feed.title) || '').substring(
						0,
						240,
					),
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

			rss = response.value;
			if (response.lastErrorObject.upserted) {
				insertedFeeds.push(rss);
			}
		}
		feeds.push(rss);
	}

	let promises = [];
	insertedFeeds.map((f) => {
		promises.push(search(f.searchDocument()));
		let rssScrapingPromise = RssQueueAdd(
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
		promises.push(rssScrapingPromise);
		if (!f.images.og && f.url) {
			let ogPromise = OgQueueAdd(
				{
					url: f.url,
					rss: f._id,
					type: 'rss',
				},
				{
					removeOnComplete: true,
					removeOnFail: true,
				},
			);
			promises.push(ogPromise);
		}
	});
	await Promise.all(promises);

	res.status(201);
	res.json(
		feeds.map((f) => {
			return f.serialize();
		}),
	);
};

exports.put = async (req, res) => {
	if (!req.User.admin) {
		return res
			.status(403)
			.json({ error: 'You must be an admin to perform this action.' });
	}

	if (!req.params.rssId) {
		return res
			.status(401)
			.json({ error: 'You must provide a valid RSS ID to perform this action' });
	}

	let rss = await RSS.findByIdAndUpdate(
		{
			_id: req.params.rssId,
		},
		req.body,
		{ new: true },
	);

	if (!rss) {
		return res
			.status(404)
			.json({ error: `Can't find RSS feed with id ${req.params.rssId}` });
	}

	res.json(rss);
};
