import podcastFinder from 'rss-finder';
import normalizeUrl from 'normalize-url';
import validUrl from 'valid-url';
import Podcast from '../models/podcast';
import personalization from '../utils/personalization';
import { ParsePodcast } from '../parsers/feed';
import strip from 'strip';
import search from '../utils/search';
import asyncTasks from '../asyncTasks';
import mongoose from 'mongoose';


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
	let podcastID = req.params.podcastId;
	if (!mongoose.Types.ObjectId.isValid(podcastID)) {
		return res.status(422).json({ error: `Podcast ID ${podcastID} is invalid.`});
	}
	let podcast = await Podcast.findById(podcastID).exec();
	if (!podcast) {
		return res.status(404).json({ error: `Can't find podcast with id ${podcastID}.` });
	}
	res.json(podcast);
};

exports.post = async (req, res) => {
	const data = Object.assign(req.body, { user: req.user.sub }) || {};

	if (!data.feedUrl || !validUrl.isUri(normalizeUrl(data.feedUrl))) {
		return res.status(400).json({ error: 'Please provide a valid podcast URL.' });
	}

	let foundPodcasts = await podcastFinder(normalizeUrl(data.feedUrl));
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

		// normalize the feed url to prevent duplicates
		let feedUrl = normalizeUrl(feed.url)
		if (!validUrl.isWebUri(feedUrl)) {
			continue
		}

		let podcast;
		podcast = await Podcast.findOne({ feedUrl: feedUrl });

		if (!podcast || (podcast && !podcast.featured)) {
			let response = await Podcast.findOneAndUpdate(
				{ feedUrl: feedUrl },
				{
					categories: 'podcast',
					description: description,
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

	let promises = []
	insertedPodcasts.map( p => {
		// schedule scraping in bull
		let scrapingPromise = asyncTasks.PodcastQueueAdd(
			{
				podcast: p._id,
				url: p.feedUrl,
			},
			{
				priority: 1,
				removeOnComplete: true,
				removeOnFail: true,
			}
		);

		promises.push(scrapingPromise);

		// add og images
		if (!p.images.og && p.link) {
			promises.push( asyncTasks.OgQueueAdd(
				{
					url: p.url,
					type: 'podcast',
				},
				{
					removeOnComplete: true,
					removeOnFail: true,
				},
			))
		}

		// schedule search index
		promises.push(search(p.searchDocument()))
	});

	await Promise.all(promises);

	res.status(200).json(podcasts);
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
