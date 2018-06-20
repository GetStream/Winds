import Pin from '../models/pin';
import config from '../config';
import { trackEngagement } from '../utils/analytics';
import { getStreamClient } from '../utils/stream';

exports.list = async (req, res) => {
	const query = req.query || {};

	if (query.type === 'episode' || query.type === 'article') {
		let obj = {};
		obj[query.type] = { $exists: true };
		obj['user'] = req.user.sub; // can only list pins for the

		res.json(await Pin.find(obj));
	} else {
		res.json(await Pin.apiQuery(req.query));
	}
};

exports.get = async (req, res) => {
	let pin = await Pin.findById(req.params.pinId);

	if (!pin) {
		return res.status(404).json({ error: 'Pin does not exist.' });
	}

	res.json(pin);
};

exports.post = async (req, res) => {
	const data = Object.assign({}, req.body, { user: req.user.sub }) || {};

	let type;
	let pin;

	if (data.hasOwnProperty('article')) {
		type = 'article';
	} else if (data.hasOwnProperty('episode')) {
		type = 'episode';
	} else {
		return res.status(422).json({
			error: 'Missing required fields.',
		});
	}

	let obj = { user: data.user };

	obj[type] = { $exists: true };
	obj[type] = data[type];

	pin = await Pin.findOne(obj);

	if (pin) {
		return res.status(409).json({ error: 'Resource already exists.' });
	} else {
		pin = await Pin.create(data);

		await getStreamClient()
			.feed('user', pin.user)
			.addActivity({
				actor: pin.user,
				verb: 'pin',
				object: pin._id,
				foreign_id: `pins:${pin._id}`,
				time: pin.createdAt,
			});

		const label = pin.article ? 'pin_article' : 'pin_episode';
		const foreignID = pin.article
			? `article:${pin.article}`
			: `episode:${pin.episode}`;
		await trackEngagement(req.User, {
			label: label,
			content: { foreign_id: foreignID },
		});

		pin = await Pin.findOne({ _id: pin._id });

		res.json(pin);
	}
};

exports.delete = async (req, res) => {
	let exists = await Pin.findOne({ _id: req.params.pinId, user: req.user.sub });

	if (!exists) {
		return res.status(404).json({ error: 'Resource does not exist.' });
	}

	await Pin.remove({ _id: req.params.pinId });

	res.sendStatus(204);
};
