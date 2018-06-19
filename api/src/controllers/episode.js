import Episode from '../models/episode';

import {TrackMetadata} from '../utils/events/analytics';
import personalization from '../utils/personalization';
import mongoose from 'mongoose';

exports.list = async (req, res) => {
	const query = req.query || {};

	let episodes = [];

	if (query.type === 'recommended') {
		let episodeIds = await personalization({
			userId: req.user.sub,
			endpoint: '/winds_episode_recommendations',
		});

		episodes = await Episode.find({ _id: { $in: episodeIds }}).find().exec();
	} else {
		if (query.podcast && !mongoose.Types.ObjectId.isValid(query.podcast)) {
			return res.status(400).json({ error: `Invalid Podcast id ${query.podcast}` });
		}
		episodes = await Episode.apiQuery(req.query);
	}

	res.json(episodes);
};

exports.get = async (req, res) => {
	if (req.params.episodeId === 'undefined') {
		return res.status(404).json({ error: 'An Episode ID is required.' });
	}

	let episode = await Episode.findById(req.params.episodeId);
	if (!episode) {
		return res.status(404).json({ error: 'Episode could not be found.' });
	}

	req.analytics.trackImpression({
		label: 'view',
		content_list: [
			{ foreign_id: `episode:${episode._id}`, },
		],
	});

	await TrackMetadata(`episode:${episode._id}`, {
		title: episode.title,
		description: episode.description,
	});

	res.json(episode);
};
