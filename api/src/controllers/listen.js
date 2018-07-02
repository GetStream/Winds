import Listen from '../models/listen';
import User from '../models/user';
import { trackEngagement } from '../utils/analytics';

import config from '../config';

exports.list = async (req, res) => {
	if (req.query.user && req.query.user != req.User.id) {
		return res.sendStatus(403);
	}

	const listens = await Listen.find({
		user: req.query.user,
		episode: req.query.episode,
	});

	res.json(listens);
};

exports.post = async (req, res) => {
	const data = Object.assign({}, req.body, { user: req.user.sub });
	const { _id, id, ...cleanedData } = data;

	const listen = await Listen.findOneAndUpdate(
		{ user: cleanedData.user, episode: cleanedData.episode },
		{ $set: cleanedData },
		{ new: true, upsert: true },
	);

	const duration = data.duration;
	if (Math.floor(duration / 15) % 4 == 0) {
		const foreign_id = `episode:${data.episode}`;
		await trackEngagement(req.User, {
			label: 'listen_progress',
			content: { foreign_id: foreign_id },
		});
	}

	res.json(listen);
};
