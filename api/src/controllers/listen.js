import Listen from '../models/listen';
import User from '../models/user';

import config from '../config';
import logger from '../utils/logger';

exports.list = async (req, res, _) => {
	if (req.query.user && req.query.user != req.User.id) {
		return res.sendStatus(403);
	}

	const listens = await Listen.apiQuery(req.query);
	res.json(listens);
};

exports.get = async (req, res, _) => {
	const listen = await Listen.findOne({ _id: req.params.listenId, user: req.User.id });

	if (!listen) {
		return res.status(404).json({ error: 'Listen does not exist.' });
	}

	res.json(listen);
};

exports.post = async (req, res, _) => {
	const data = Object.assign({}, req.body, { user: req.user.sub });

	const listen = await Listen.findOneAndUpdate(
		{ user: data.user, episode: data.episode },
		{ $set: data },
		{ new: true, upsert: true },
	);

	res.json(listen);
};

exports.delete = async (req, res, _) => {
	const listen = await Listen.findOne({ _id: req.params.listenId, user: req.User.id });

	if (!listen) {
		return res.status(404).json({ error: 'Listen does not exist.' });
	}

	await Listen.remove({ _id: req.params.listenId });

	res.status(204).send();
};
