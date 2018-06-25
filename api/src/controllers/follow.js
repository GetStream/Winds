import stream from 'getstream';
import async from 'async';

import Follow from '../models/follow';
import User from '../models/user';

import config from '../config';
import logger from '../utils/logger';

exports.list = async (req, res) => {
	const lookup = { user: req.user.sub }
	if (req.query.type === 'rss') {
		lookup['rss'] = {$exist: true}
	} else if (req.query.type === 'podcast') {
		lookup['podcast'] = {$exist: true}
	} else {
		throw Error('shouldnt happen')
	}
	const follows = Follow.find(lookup)
	return res.json(follows)
};

exports.post = async (req, res) => {
	const query = req.query || {};
	const data = Object.assign({}, req.body, { user: req.user.sub }) || {};
	let follow

	if (!query.type) {
		return res.status(422).send('Missing required type query parameter.');
	}
	if (query.type === 'podcast') {
		follow = await Follow.getOrCreate('podcast', data.user, query.podcast)
	} else if (query.type === 'rss') {
		follow = await Follow.getOrCreate('rss', data.user, query.rss)
	}
	return res.json(follow)
};

exports.delete = async (req, res) => {
	const query = req.query || {};
	const data = Object.assign({}, req.body, { user: req.user.sub }) || {};

	const lookup = { user: req.user.sub }
	if (req.query.rss) {
		lookup['rss'] = req.query.rss
	} else if (req.query.podcast) {
		lookup['podcast'] = req.query.podcast
	} else {
		throw new Error('shouldnt happen')
	}

	const follow = await Follow.findOne(lookup)
	await follow.removeFromStream()
	await follow.remove()

	return res.status(204).send();
};
