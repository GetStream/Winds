import mongoose from 'mongoose';
import normalizeUrl from 'normalize-url';

import Podcast from '../models/podcast';

import { isURL } from '../utils/validation';
import { isBlockedURLs } from '../utils/blockedURLs';
import { discoverRSS } from '../parsers/discovery';
import { getPodcastRecommendations } from '../utils/personalization';
import { ParsePodcast } from '../parsers/feed';
import strip from 'strip';
import search from '../utils/search';
import { PodcastQueueAdd, OgQueueAdd } from '../asyncTasks';

exports.list = async (req, res) => {
	let query = req.query || {};
	let podcasts;

	if (query.type === 'recommended') {
		podcasts = await getPodcastRecommendations(req.User._id.toString(), 7);
	} else {
		podcasts = await Podcast.apiQuery(req.query);
	}

	res.json(podcasts);
};

exports.get = async (req, res) => {
	const podcastId = req.params.podcastId;

	if (!mongoose.Types.ObjectId.isValid(podcastId)) {
		return res
			.status(422)
			.json({ error: `Podcast ID ${podcastId} is an invalid ObjectId.` });
	}

	let podcast = await Podcast.findById(podcastId).exec();
	if (!podcast) {
		return res.status(404).json({ error: `Resource not found.` });
	}

	res.json(podcast.serialize());
};

exports.post = async (req, res) => {
	const data = Object.assign(req.body, { user: req.user.sub }) || {};

	// todo refactor this check for validating partial urls like google.com
	let url;

	try {
		url = normalizeUrl(data.feedUrl);
	} catch (e) {
		return res.status(400).json({ error: 'Please provide a valid podcast URL.' });
	}

	if (!data.feedUrl || !isURL(url)) {
		return res.status(400).json({ error: 'Please provide a valid podcast URL.' });
	}

	if (isBlockedURLs(data.feedUrl)) {
		return res.status(400).json({ error: 'This podcast can not be added.' });
	}

	let foundPodcasts = await discoverRSS(normalizeUrl(data.feedUrl));
	if (!foundPodcasts.feedUrls.length) {
		return res.status(404).json({ error: `Can't find any podcasts.` });
	}

	let insertedPodcasts = [];
	let podcasts = [];

	for (let feed of foundPodcasts.feedUrls.slice(0, 10)) {
		let podcastContent = await ParsePodcast(feed.url, 1);
		let title, url, images, description;

		if (podcastContent) {
			title = strip(podcastContent.title) || strip(feed.title);
			url = podcastContent.link || foundPodcasts.site.url;
			images = {
				favicon: foundPodcasts.site.favicon,
				og: podcastContent.image,
			};
			description = podcastContent.description;
		} else {
			title = strip(feed.title);
			url = foundPodcasts.site.url;
			images = { favicon: foundPodcasts.site.favicon };
			description = '';
		}

		let feedUrl = normalizeUrl(feed.url);
		if (!isURL(feedUrl)) {
			continue;
		}

		let podcast;
		podcast = await Podcast.findOne({ feedUrl: feedUrl });

		if (!podcast || (podcast && !podcast.featured)) {
			let response = await Podcast.findOneAndUpdate(
				{ feedUrl: feedUrl },
				{
					categories: 'podcast',
					description: (description || '').substring(0, 240),
					feedUrl: feedUrl,
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

			podcast = response.value;

			if (response.lastErrorObject.upserted) {
				insertedPodcasts.push(podcast);
			}
		}

		podcasts.push(podcast);
	}

	let promises = [];
	insertedPodcasts.map((p) => {
		let scrapingPromise = PodcastQueueAdd(
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

		promises.push(scrapingPromise);

		if (!p.images.og && p.link) {
			promises.push(
				OgQueueAdd(
					{
						url: p.link,
						podcast: p._id,
						type: 'podcast',
					},
					{
						removeOnComplete: true,
						removeOnFail: true,
					},
				),
			);
		}

		promises.push(search(p.searchDocument()));
	});

	await Promise.all(promises);

	res.status(200).json(
		podcasts.map((p) => {
			return p.serialize();
		}),
	);
};

exports.put = async (req, res) => {
	const podcastId = req.params.podcastId;

	if (!mongoose.Types.ObjectId.isValid(podcastId)) {
		return res
			.status(422)
			.json({ error: `Podcast ID ${podcastId} is an invalid ObjectId.` });
	}

	if (!req.User.admin) {
		return res.status(403).send();
	}

	if (!podcastId) {
		return res.status(401).json({ error: 'Missing required Podcast ID.' });
	}

	let podcast = await Podcast.findByIdAndUpdate({ _id: podcastId }, req.body, {
		new: true,
	});

	if (!podcast) {
		return res.status(404).json({ error: 'Podcast could not be found.' });
	}

	res.json(podcast);
};
