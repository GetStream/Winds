import Listen from '../models/listen';
import User from '../models/user';

import config from '../config';
import logger from '../utils/logger';
import events from '../utils/events';

exports.list = async (req, res, _) => {
	if (req.query.user && req.query.user != req.User.id) {
		return res.sendStatus(403);
	}

	try {
		const listens = await Listen.apiQuery(req.query);
		res.json(listens);
	} catch(err) {
		logger.error({err});
		res.status(422).send(err.errors);
	}
};

exports.get = async (req, res, _) => {
	if (req.params.listenId == 'undefined') {
		return res.sendStatus(404);
	}

	try {
		const listen = await Listen.findById(req.params.listenId);
		if (!listen) {
			return res.sendStatus(404);
		}
		if (listen.user.id != req.User.id) {
			return res.sendStatus(403);
		}

		res.json(listen);
	} catch(err) {
		logger.error({err});
		res.status(422).send(err.errors);
	}
};

exports.post = async (req, res, _) => {
	const data = Object.assign({}, req.body, { user: req.user.sub });

	try {
		const listen = await Listen.findOneAndUpdate(
			{ user: data.user, episode: data.episode },
			{ $set: data },
			{ new: true, upsert: true },
		);
		const user = await User.findById(data.user);
		try {
			await events({
				user: user._id,
				email: user.email.toLowerCase(),
				engagement: {
					label: 'listen',
					content: {
						foreign_id: `episode:${listen.episode}`,
						duration: listen.duration,
					},
				},
			});
			res.json(listen);
		} catch(err) {
			logger.error({err});
			res.sendStatus(503);
		}
	} catch(err) {
		logger.error({err});
		res.status(422).send(err.errors);
	}
};

exports.delete = async (req, res, _) => {
	try {
		const listen = await Listen.findById(req.params.listenId);
		if (!listen) {
			return res.sendStatus(404);
		}
		if (listen.user.id != req.User.id) {
			return res.sendStatus(403);
		}

		await Listen.remove({ _id: req.params.listenId });
		res.status(204).send();
	} catch(err) {
		logger.error({err});
		res.status(422).send(err.errors);
	}
};
