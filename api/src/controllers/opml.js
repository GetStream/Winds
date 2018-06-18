import opmlParser from 'node-opml-parser';
import opmlGenerator from 'opml-generator';
import moment from 'moment';
import entities from 'entities';
import normalizeUrl from 'normalize-url';
import stream from 'getstream';

import RSS from '../models/rss';
import Podcast from '../models/podcast';

import Follow from '../models/follow';
import User from '../models/user';
import util from 'util';

import config from '../config';
import {RssQueueAdd, PodcastQueueAdd} from '../asyncTasks';
import { IsPodcastURL} from '../parsers/detect-type';
import search from '../utils/search';
import {isURL} from '../utils/validation';

import { TrackMetadata } from '../utils/events/analytics';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

exports.get = async (req, res) => {
	let userID = req.user.sub;
	let follows = await Follow.find({ user: userID });

	let user = await User.find({ userID });
	if (!user) {
		return res.status(404).json({ error: 'User does not exist.' });
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

exports.post = async (req, res) => {
	const userID = req.user.sub;
	const upload = Buffer.from(req.file.buffer).toString('utf8');

	if (!upload) {
		return res.status(422).json({ error: 'Invalid OPML upload.' });
	}

	let feeds = await util.promisify(opmlParser)(upload);

	let parsedFeeds = feeds.map(feed => {
		feed.valid = true;

		if (isURL(feed.feedUrl)) {
			feed.feedUrl = normalizeUrl(feed.feedUrl).trim();
		} else {
			feed.valid = false;
		}

		if (isURL(feed.url)) {
			feed.url = normalizeUrl(feed.url);
		}

		feed.favicon = '';
		if (feeds.site && feeds.site.favicon) {
			feed.favicon = feeds.site.favicon;
		}

		return feed;
	});

	let promises = [];
	for (let feed of parsedFeeds) {
		let promise = followOPMLFeed(feed, userID);
		promises.push(promise);
	}

	let results = await Promise.all(promises);

	return res.json(results);
};

async function followOPMLFeed(feed, userID) {
	let schema;
	let publicationType;
	let isPodcast;

	let result = {
		feedUrl: feed.feedUrl,
		follow: {}
	};

	if (!feed.valid) {
		result.error = `Invalid feedUrl ${feed.feedUrl}`;
		return result;
	}

	try {
		isPodcast = await IsPodcastURL(feed.feedUrl);
	} catch(e) {
		result.error = `Error opening ${feed.feedUrl}`;
		return result;
	}

	if (isPodcast) {
		schema = Podcast;
		publicationType = 'podcast';
	} else {
		schema = RSS;
		publicationType = 'rss';
	}

	let feedUrl = normalizeUrl(feed.feedUrl)
	if (!isURL(feedUrl)) {
		result.error = `Invalid URL for OPML import ${feedUrl}`;
		return result
	}

	let instance = await schema.findOne({ feedUrl: feedUrl });

	if (!instance) {
		let data = {
			categories: publicationType,
			description: entities.decodeHTML(feed.title),
			favicon: feed.favicon,
			feedUrl: feedUrl,
			lastScraped: moment().subtract(12, 'hours'),
			public: true,
			publicationDate: moment().toISOString(),
			title: entities.decodeHTML(feed.title),
			url: feed.url,
		};

		instance = await schema.create(data);

		let queueData = { url: feedUrl };
		queueData[publicationType] = instance._id;

		let queue =
			publicationType == 'rss'
				? RssQueueAdd
				: PodcastQueueAdd;

		await queue(queueData, {
			priority: 1,
			removeOnComplete: true,
			removeOnFail: true,
		});

		await search(instance.searchDocument());
	}
	// always create the follow
	let publicationID = instance._id
	let follow = await Follow.getOrCreate(publicationType, userID, publicationID)


	await TrackMetadata(`${publicationType}:${publicationID}`, {
		description: instance.description,
		title: instance.title,
	});

	result.follow = follow;

	return result;
}
