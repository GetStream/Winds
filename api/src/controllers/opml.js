import events from '../utils/events';
import async from 'async';
import isUrl from 'url-regex';
import opmlParser from 'node-opml-parser';
import opmlGenerator from 'opml-generator';
import moment from 'moment';
import entities from 'entities';
import normalizeUrl from 'normalize-url';
import stream from 'getstream';
import search from '../utils/search';

import RSS from '../models/rss';
import Follow from '../models/follow';
import User from '../models/user';
import util from 'util';

import config from '../config';
import logger from '../utils/logger';
import async_tasks from '../async_tasks';
import axios from 'axios';
import FeedParser from 'feedparser';
import { IsPodcastURL} from '../parsers/detect-type';



const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

// opml export
exports.get = async (req, res) => {
	let userID = req.user.sub;
	let follows = await Follow.find({ user: userID });

	let user = await User.find({ userID });
	if (!user) {
		return res.sendStatus(404)
	}

	let header = {
		dateCreated: moment().toISOString(),
		ownerName: user.name,
		title: `Subscriptions in Winds - Powered by ${config.product.author}`,
	};

	let outlines = follows.map(follow => {
		let feed = follow.rss ? follow.rss : follow.podcast;
		let feedType = follow.rss ? 'rss' : 'podcast';
		let obj = {
			htmlUrl: feed.url,
			title: feed.title,
			type: feedType,
			xmlUrl: feed.feedUrl,
		};
		return obj;
	});
	let opml = opmlGenerator(header, outlines);

	res.set({
		'Content-Disposition': 'attachment; filename=export.opml;',
		'Content-Type': 'application/xml',
	});

	res.end(opml);
};

// handle an OPML import
exports.post = async (req, res) => {
	const userID = req.user.sub;
	const upload = Buffer.from(req.file.buffer).toString('utf8');
	const data = Object.assign({}, req.body, { user: req.user.sub }) || {};

	if (!upload) {
		return res.sendStatus(422);
	}
	let feeds = await util.promisify(opmlParser)(upload);
	let parsedFeeds = feeds.map(feed => {
		feed.valid = true;

		if (isUrl().test(feed.feedUrl)) {
			feed.feedUrl = normalizeUrl(feed.feedUrl);
		} else {
			feed.valid = false;
		}

		if (isUrl().test(feed.url)) {
			feed.url = normalizeUrl(feed.url);
		}

		feed.favicon = '';
		if (feeds.site && feeds.site.favicon) {
			feed.favicon = feeds.site.favicon;
		}

		return feed;
	});

	// follow the OPML feeds
	let promises = [];
	for (let feed of parsedFeeds) {
			let promise = followOPMLFeed(feed, userID);
			promises.push(promise);
	}
	let statuses = await Promise.all(promises);

	return res.json(statuses);
};



// Follow the OPML feed
async function followOPMLFeed(feed, userID) {
	let instance, schema, publicationType;
	let result = {'feedUrl': feed.feedUrl, 'follow': {}}
	let isPodcast
	if (!feed.valid) {
		result.error = `Invalid feedUrl ${feed.feedUrl}`
		return result
	}

	try {
		isPodcast = await IsPodcastURL(feed.feedUrl)
	} catch(e) {
		// just skip invalid feeds
		result.error = `Error opening ${feed.feedUrl}`
		return result
	}

	if (isPodcast) {
		schema = Podcast;
		publicationType = 'podcast';
	} else {
		schema = RSS;
		publicationType = 'rss';
	}

	instance = await schema.findOne({ feedUrl: feed.feedUrl });
	// create the feed if it doesn't exist
	if (!instance) {
		let data = {
			categories: publicationType,
			description: entities.decodeHTML(feed.title),
			favicon: feed.favicon,
			feedUrl: feed.feedUrl,
			lastScraped: moment().subtract(12, 'hours'),
			public: true,
			publicationDate: moment().toISOString(),
			title: entities.decodeHTML(feed.title),
			url: feed.url,
		};
		instance = await RSS.create(data);
		/*
    let searchResponse = await search({
        _id: instance._id,
        categories: publicationType,
        description: instance.title,
        image: instance.favicon,
        public: true,
        publicationDate: instance.publicationDate,
        title: instance.title,
        type: publicationType,
    })*/

		// Scrape with high priority
		let queueData = { url: instance.feedUrl };
		queueData[publicationType] = instance._id;
		let queue =
			publicationType == 'rss'
				? async_tasks.RssQueueAdd
				: async_tasks.PodcastQueueAdd;

		await queue(queueData, {
			priority: 1,
			removeOnComplete: true,
			removeOnFail: true,
		});
	}
	// always create the follow
	// TODO: abstract this follow logic
	let followData = { user: userID };
	followData[publicationType] = instance._id;
	let response = await Follow.findOneAndUpdate(followData, followData, {rawResult: true, upsert: true, new: true});
	let follow = response.value
	let instanceID = response.value._id

	if (response.lastErrorObject.updatedExisting) {
		await streamClient.feed('user_article', userID).follow(publicationType, instanceID);
		await streamClient.feed('timeline', userID).follow(publicationType, instanceID);
	}

	let eventResponse = await events({
		meta: {
			data: {
				[`${publicationType}:${instanceID}`]: {
					description: instance.description,
					title: instance.title,
				},
			},
		},
	});
	result.follow =follow

	return result;
}
