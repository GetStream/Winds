import stream from 'getstream';
import async from 'async';
import mongoose from 'mongoose';

import Follow from '../models/follow';
import User from '../models/user';
import Podcast from '../models/podcast';
import RSS from '../models/rss';

import config from '../config';
import logger from '../utils/logger';
import { getStreamClient } from '../utils/stream';

exports.list = async (req, res) => {
	const lookup = { user: req.user.sub };

	if (req.query.type === 'rss') {
		lookup['rss'] = { $exists: true };
	} else if (req.query.type === 'podcast') {
		lookup['podcast'] = { $exists: true };
	} else if (req.query.rss) {
		lookup['rss'] = req.query.rss;
	} else if (req.query.podcast) {
		lookup['podcast'] = req.query.podcast;
	} else {
		throw new Error('Invalid parameter passed to follow list endpoint.');
	}

	const follows = await Follow.find(lookup);

	return res.json(follows);
};

exports.post = async (req, res) => {
	const query = req.query || {};
	const user = req.user.sub;

	let follow;

	if (!query.type || (!query.podcast && !query.rss)) {
		return res.status(422).send('Missing required type query parameter.');
	}

	if (query.type === 'podcast') {
		if (!mongoose.Types.ObjectId.isValid(query.podcast)) {
			return res.status(400).json({
				error: `Parameter podcast (${query.podcast}) is an invalid ObjectId.`,
			});
		}

		let podcast = await Podcast.findById(query.podcast);

		if (!podcast) {
			return res.status(404).json({ error: 'Resource not found.' });
		}

		follow = await Follow.getOrCreate('podcast', user, query.podcast);
	} else if (query.type === 'rss') {
		if (!mongoose.Types.ObjectId.isValid(query.rss)) {
			return res.status(400).json({
				error: `Parameter rss (${query.rss}) is an invalid ObjectId.`,
			});
		}

		let rss = await RSS.findById(query.rss);

		if (!rss) {
			return res.status(404).json({ error: 'Resource not found.' });
		}

		follow = await Follow.getOrCreate('rss', user, query.rss);
	} else {
		return res.status(400).json({ error: 'Missing required parameter.' });
	}

	return res.json(follow);
};

exports.delete = async (req, res) => {
	const query = req.query || {};
	const lookup = { user: req.user.sub };

	if (query.rss) {
		lookup['rss'] = query.rss;
	} else if (query.podcast) {
		lookup['podcast'] = query.podcast;
	} else {
		return res
			.send(400)
			.json({ error: 'Invalid parameter passed to delete method.' });
	}

	const follow = await Follow.findOne(lookup);
	if (follow) {
		await follow.removeFromStream();
		await follow.remove();
	}

	return res.status(204).send();
};
