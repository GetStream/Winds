import Episode from '../models/episode';

import {TrackMetadata} from '../utils/events/analytics';
import personalization from '../utils/personalization';

exports.list = async (req, res) => {
	const query = req.query || {};
	let episodes = [];
	if (query.type === 'recommended') {
		let episodeIds = personalization({
			userId: req.user.sub,
			endpoint: '/winds_episode_recommendations',
		});
		episodes = await Episode.find({id: {$in: episodeIds}, valid: true}).find().exec();
	} else {
		episodes = await Episode.apiQuery(req.query);
	}
	return res.json(episodes);
};

exports.get = async (req, res) => {
	if (req.params.episodeId === 'undefined') {
		return res.sendStatus(404);
	}

	let episode = await Episode.findById(req.params.episodeId);
	if (!episode) {
		return res.sendStatus(404);
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
