import async from 'async';
import stream from 'getstream';

import Pin from '../models/pin';

import config from '../config';
import logger from '../utils/logger';
import events from '../utils/events';

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret);

exports.list = async (req, res) => {
	const query = req.query || {};

	if (query.type == 'episode' || query.type == 'article') {
		let obj = {};
		obj[query.type] = { $exists: true };

		if (query.user) {
			obj['user'] = query.user;
		}

		res.json(await Pin.find(obj));
	} else {
		res.json(await Pin.apiQuery(req.query));
	}
};

exports.get = async (req, res) => {
	let pin = await Pin.findById(req.params.pinId);

	if (!pin) {
		return res.sendStatus(404);
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
		return res.status(422).send(err);
	}

	let obj = {
		user: data.user,
	};

	obj[type] = { $exists: true };
	obj[type] = data[type];

  	pin = await Pin.findOne(obj);

	if (pin) {
		return res.sendStatus(409);
	} else {
		pin = await Pin.create(data);

		await client
			.feed('user', pin.user)
			.addActivity({
				actor: pin.user,
				verb: 'pin',
				object: pin._id,
				foreign_id: `pins:${pin._id}`,
				time: pin.createdAt,
			});

		res.json(pin);
	}
};

exports.delete = async (req, res) => {
	let exists = await Pin.findOne({ _id: req.params.pinId, user: req.user.sub });

	if (!exists) {
		return res.sendStatus(404);
	}

	await Pin.remove({ _id: req.params.pinId });

	res.sendStatus(204);
};
