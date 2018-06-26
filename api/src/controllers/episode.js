import Episode from '../models/episode';

import { getEpisodeRecommendations } from '../utils/personalization';
import mongoose from 'mongoose';

exports.list = async (req, res) => {
	const query = req.query || {};

	let episodes = [];

	if (query.type === 'recommended') {
		episodes = await getEpisodeRecommendations(req.User);
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
		return res.status(404).json({ error: 'Missing required field episodeId.' });
	}

	let episode = await Episode.findById(req.params.episodeId);
	if (!episode) {
		return res.status(404).json({ error: 'Episode could not be found.' });
	}

	res.json(episode);
};
