import async from 'async';
import validator from 'validator';

import User from '../models/user';
import RSS from '../models/rss';
import Podcast from '../models/podcast';

import logger from '../utils/logger';
import personalization from '../utils/personalization';

exports.list = async (req, res) => {
	const query = req.query || {};
	let users = [];

	if (query.type === 'recommended') {
		let recommendedUserIds = await personalization({
			endpoint: '/winds_user_recommendations', userId: req.user.sub,
		});
		users = await User.find({_id: {$in: recommendedUserIds}});
	} else {
		users = await User.apiQuery(req.query).select('name email username bio url twitter background admin');
	}
	res.json(users);
};

exports.delete = async (req, res) => {
	// Only permit access to the authenticated user's own model
	if (req.params.userId !== req.user.sub) {
		return res.sendStatus(403);
	}
	await req.User.remove();
	res.sendStatus(204);
};

exports.get = async (req, res) => {
	if (req.params.user == 'undefined') {
		return res.sendStatus(404);
	}

	User.findById(req.params.userId)
		.then(user => {
			if (!user) {
				res.status(404).send('User not found');
			} else {
				user.password = undefined;
				user.recoveryCode = undefined;

				let serialized = user;
				if (user._id === req.user.sub) {
					serialized = user.serializeAuthenticatedUser();
				}
				res.json(serialized);
			}
		})
		.catch(err => {
			logger.error(err);
			res.status(422).send(err.errors);
		});
};

exports.put = async (req, res) => {
	// Only permit access to the authenticated user's own model
	if (req.params.userId !== req.user.sub) {
		res.status(403).send();
		return;
	}

	const data = req.body || {};

	if (data.email && !validator.isEmail(data.email)) {
		res.status(422).send('Invalid email address.');
		return;
	}

	if (data.username && !validator.isAlphanumeric(data.username)) {
		res.status(422).send('Usernames must be alphanumeric.');
		return;
	}

	let user = await User.findById(req.params.userId);

	if (!user) {
		res.sendStatus(404);
		return;
	}

	if (data.username) {
		// check for existing username
		let userByUsername = await User.findOne({username: data.username});
		if (userByUsername && userByUsername.id != user.id) {
			res.status(409).send('User with this username already exists');
			return;
		}
	}
	if (data.email) {
		// check for existing email
		let userByEmail = await User.findOne({email: data.email});
		if (userByEmail && userByEmail.email != user.email) {
			res.status(409).send('User with this email already exists');
			return;
		}
	}

	// TODO: we don't allow you to edit this... so what's up?
	/*
	if (data.interests) {
		const promises = data.interests.flatMap(async (interest) => {
			// find all rss feeds and podcasts for that interest, and follow them
			return [
				RSS.find({interest}).then(rssFeeds => rssFeeds.map(rssFeed => followRssFeed(req.params.userId, rssFeed._id))),
				Podcast.find({interest}).then(podcasts => podcasts.map(podcast => followPodcast(req.params.userId, podcast._id))),
			];
		});
		await Promise.all(promises);
	}*/

	// update the user
	user = await User.findByIdAndUpdate(
		{ _id: req.params.userId },
		data,
		{new: true}
	);

	// send back the user
	user.password = undefined;
	user.recoveryCode = undefined;
	res.status(201).json(user);
};
