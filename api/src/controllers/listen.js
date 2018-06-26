import Listen from '../models/listen';
import User from '../models/user';
import { trackEngagement } from '../utils/analytics';

import config from '../config';
import logger from '../utils/logger';

exports.post = async (req, res, _) => {
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
