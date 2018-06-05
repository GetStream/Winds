import podcastFinder from 'rss-finder';
import normalizeUrl from 'normalize-url';
import validUrl from 'valid-url';
import Podcast from '../models/podcast';
import personalization from '../utils/personalization';
import { ParsePodcast } from '../parsers/feed';
import strip from 'strip';
import search from '../utils/search';
import asyncTasks from '../asyncTasks';


exports.list = async (req, res) => {
	let query = req.query || {};
	let podcasts = [];
	if (query.type === 'recommended') {
		let podcastIDs = await personalization({
			endpoint: '/winds_podcast_recommendations',
			userId: req.user.sub,
		});
		podcasts = await Podcast.find({ _id: {$in: podcastIDs} }).exec();
	} else {
		podcasts = await Podcast.apiQuery(req.query);
	}
	res.json(podcasts);
};

exports.get = async (req, res) => {
	if (req.params.podcastId === 'undefined') {
		return res.sendStatus(404);
	}
	let podcast = await Podcast.findById(req.params.podcastId).exec();
	if (!podcast) {
		return res.sendStatus(404);
	}
	res.json(podcast);
};

exports.post = async (req, res) => {
	const data = Object.assign(req.body, { user: req.user.sub }) || {};

	if (!data.feedUrl || !validUrl.isUri(normalizeUrl(data.feedUrl))) {
		return res.status(400).send('Please provide a valid podcast URL.');
	}

	let foundPodcasts = await podcastFinder(normalizeUrl(data.feedUrl));
	if (!foundPodcasts.feedUrls.length) {
		return res.status(404);
	}

	let insertedPodcasts = [];

	for (var feed of foundPodcasts.feedUrls) {
		let podcastContents = await ParsePodcast(feed.url, 1);
		let title, url, images, description;
		if (podcastContents) {
			title = strip(podcastContents.title) || strip(feed.title);
			url = podcastContents.link || foundPodcasts.site.url;
			images = {
				favicon: foundPodcasts.site.favicon,
				og: podcastContents.image,
			};
			description = podcastContents.description;
		} else {
			title = strip(feed.title);
			url = foundPodcasts.site.url;
			images = { favicon: foundPodcasts.site.favicon };
			description = '';
		}
		let rss = await Podcast.findOneAndUpdate(
			{ feedUrl: feed.url },
			{
				categories: 'podcast',
				description: description,
				feedUrl: feed.url,
				images: images,
				lastScraped: new Date(0),
				title: title,
				url: normalizeUrl(url),
				valid: true,
			},
			{
				new: true,
				rawResult: true,
				upsert: true,
			},
		);
		if (rss.lastErrorObject.upserted) {
			insertedPodcasts.push(rss.value);
		}
	}

	insertedPodcasts.map(async p => {
		await asyncTasks.PodcastQueueAdd(
			{
				podcast: p._id,
				url: p.feedUrl,
			},
			{
				priority: 1,
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
	});

	insertedPodcasts.map(async p => {
		if (!p.images.og && p.link) {
			await asyncTasks.OgQueueAdd(
				{
					url: p.url,
					type: 'podcast',
				},
				{
					removeOnComplete: true,
					removeOnFail: true,
				},
			);
		}
	});

	insertedPodcasts.map(async f => {
		await search(f.searchDocument());
	});

	res.status(201);
	res.json(insertedPodcasts);
};

exports.put = async (req, res) => {
	if (!req.User.admin) {
		return res.status(403).send();
	}
	if (!req.params.podcastId) {
		return res.status(401).send();
	}
	let podcast = await Podcast.findByIdAndUpdate(
		{ _id: req.params.podcastId },
		req.body,
		{new: true},
	);
	if (!podcast) {
		return res.sendStatus(404);
	}
	res.json(podcast);
};
