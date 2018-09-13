import Episode from '../models/episode';

import { getEpisodeRecommendations } from '../utils/personalization';
import { trackEngagement } from '../utils/analytics';
import mongoose from 'mongoose';

exports.list = async (req, res) => {
	const query = req.query || {};

	let episodes = [];

	if (query.type === 'recommended') {
		episodes = await getEpisodeRecommendations(req.User._id.toString());
	} else {
		if (query.podcast && !mongoose.Types.ObjectId.isValid(query.podcast)) {
			return res.status(400).json({ error: `Invalid Podcast id ${query.podcast}` });
		}
		episodes = await Episode.apiQuery(req.query);
	}

	res.json(episodes);
};

exports.get = async (req, res) => {
	const episodeId = req.params.episodeId;

	if (episodeId === 'undefined') {
		return res.status(404).json({ error: 'Missing required field episodeId.' });
	}

	if (!mongoose.Types.ObjectId.isValid(episodeId)) {
		return res
			.status(400)
			.json({ error: `Resource episodeId (${episodeId}) is an invalid ObjectId.` });
	}

	let episode = await Episode.findById(episodeId);
	if (!episode) {
		return res.status(404).json({ error: 'Episode could not be found.' });
	}

	if (req.query && req.query.type === 'parsed') {
		try {
			const parsed = await episode.getParsedEpisode();
			if (!parsed) {
				return res.status(400).json({ error: 'Failed to parse the episode.' });
			}
			await trackEngagement(req.User, {
				label: 'open_episode',
				content: { foreign_id: `episode:${episodeId}` },
			});

			return res.json(parsed);
		} catch (err) {
			return res.status(400).json({ error: 'Failed to parse the episode.' });
		}
	}

	res.json(episode);
};
