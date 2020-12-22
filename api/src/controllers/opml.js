import opmlParser from 'node-opml-parser';
import opmlGenerator from 'opml-generator';
import moment from 'moment';
import entities from 'entities';
import normalizeUrl from 'normalize-url';
import stream from 'getstream';
import util from 'util';

import RSS from '../models/rss';
import Podcast from '../models/podcast';

import Follow from '../models/follow';
import User from '../models/user';

import config from '../config';
import { isBlockedURLs } from '../utils/blockedURLs';
import * as rateLimit from '../utils/rate-limiter';
import { RssQueueAdd, PodcastQueueAdd } from '../asyncTasks';
import { IsPodcastURL } from '../parsers/detect-type';
import search from '../utils/search';
import { isURL } from '../utils/validation';

exports.get = async (req, res) => {
	let follows = await Follow.find({ user: req.user.sub });

	let user = await User.find({ _id: req.user.sub });
	if (!user) {
		return res.status(404).json({ error: 'User does not exist.' });
	}

	let header = {
		dateCreated: moment().toISOString(),
		ownerName: user.name,
		title: `Subscriptions in Winds - Powered by ${config.product.author}`,
	};

	let outlines = follows.map((follow) => {
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

function partitionBy(collection, selector) {
	if (!collection.length) {
		return [];
	}

	const partitions = [[collection[0]]];
	let currentPartition = 0;
	let lastElement = selector(collection[0]);
	for (let i = 1; i < collection.length; ++i) {
		const element = selector(collection[i]);
		if (element !== lastElement) {
			partitions.push([]);
			++currentPartition;
		}
		partitions[currentPartition].push(collection[i]);
		lastElement = element;
	}
	return partitions;
}

async function identifyFeedType(feed) {
	let schema;
	let publicationType;
	let isPodcast;

	if (!feed.valid) {
		throw new Error(`Invalid feedUrl ${feed.feedUrl}`);
	}

	try {
		isPodcast = await IsPodcastURL(feed.feedUrl);
	} catch (_) {
		throw new Error(`Error opening ${feed.feedUrl}`);
	}

	if (isPodcast) {
		schema = Podcast;
		publicationType = 'podcast';
	} else {
		schema = RSS;
		publicationType = 'rss';
	}

	const feedUrl = normalizeUrl(feed.feedUrl);
	if (!isURL(feedUrl)) {
		throw new Error(`Invalid URL for OPML import ${feedUrl}`);
	}

	return { feed, schema, publicationType, url: feedUrl };
}

async function getOrCreateManyPublications(feeds) {
	if (!feeds.length) {
		return [];
	}

	const feedUrls = feeds.map((p) => p.url);
	const instances = await feeds[0].schema.find({ feedUrl: { $in: feedUrls } });

	const existingFeedUrls = new Set(instances.map((i) => i.feedUrl));
	const newPublications = feeds.filter((p) => !existingFeedUrls.has(p.url));

	if (!newPublications.length) {
		return instances;
	}

	const newInstanceData = newPublications.map((p) => {
		const title = entities.decodeHTML(p.feed.title) || '';
		return {
			categories: p.publicationType,
			description: title.substring(0, 240),
			favicon: p.feed.favicon,
			feedUrl: p.url,
			lastScraped: moment().subtract(12, 'hours'),
			public: true,
			publicationDate: moment().toISOString(),
			title,
			url: p.feed.url,
		};
	});

	const newInstances = await feeds[0].schema.insertMany(newInstanceData);

	const queue =
		feeds[0].publicationType.toLowerCase() == 'rss' ? RssQueueAdd : PodcastQueueAdd;
	const queueData = newInstances.map((i) => ({
		[i.categories]: i._id,
		url: i.feedUrl,
	}));

	const enqueues = queueData.map((d) =>
		queue(d, { priority: 1, removeOnComplete: true, removeOnFail: true }),
	);
	const indexing = newInstances.map((i) => search(i.searchDocument()));

	await Promise.all(enqueues.concat(indexing));

	return instances.concat(newInstances);
}

exports.post = async (req, res) => {
	const upload = Buffer.from(req.file.buffer).toString('utf8');

	if (!upload) {
		return res.status(422).json({ error: 'Invalid OPML upload.' });
	}

	let feeds;

	try {
		feeds = await util.promisify(opmlParser)(upload);
	} catch (e) {
		return res.status(422).json({ error: 'Invalid OPML upload.' });
	}

	for (const feed of feeds) {
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
	}

	const feedIdentities = await Promise.all(
		feeds.map(async (f) => {
			try {
				if (isBlockedURLs(feeds.feedUrl)) {
					return { feedUrl: f.feedUrl, error: "this feed can't be added" };
				}
				return { result: await identifyFeedType(f) };
			} catch (err) {
				return { feedUrl: f.feedUrl, error: err.message };
			}
		}),
	);

	const failedFeeds = feedIdentities.filter((f) => !!f.error);
	const feedSchemas = feedIdentities.filter((f) => !f.error).map((f) => f.result);

	feedSchemas.sort((lhs, rhs) =>
		lhs.publicationType.localeCompare(rhs.publicationType),
	);

	//XXX: process podcasts first, then rss to allow bulk operations
	const partitions = partitionBy(feedSchemas, (p) => p.schema);

	let publications = [];
	const chunkSize = 1000;
	for (const feeds of partitions) {
		for (let offset = 0; offset < feeds.length; offset += chunkSize) {
			const limit = offset + chunkSize;
			const chunk = feeds.slice(offset, limit);

			publications = publications.concat(await getOrCreateManyPublications(chunk));
		}
	}

	let follows = [];
	for (let offset = 0; offset < publications.length; offset += chunkSize) {
		const limit = offset + chunkSize;
		const chunk = publications.slice(offset, limit);

		await rateLimit.tick(req.user.sub);

		const followInstructions = chunk.map((p) => ({
			type: p.categories.toLowerCase(),
			userID: req.user.sub,
			publicationID: p._id,
		}));
		const newFollows = await Follow.getOrCreateMany(followInstructions);
		follows = follows.concat(
			newFollows.map((f, i) => ({ feedUrl: chunk[i].url, follow: f })),
		);
	}

	const errors = failedFeeds.map((f) => ({ ...f, follow: {} }));

	return res.json(follows.concat(errors));
};
