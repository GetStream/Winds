import async from 'async';
import validator from 'validator';

import User from '../models/user';
import RSS from '../models/rss';
import Podcast from '../models/podcast';

import logger from '../utils/logger';
import personalization from '../utils/personalization';

import followRssFeed from '../shared/followRssFeed';
import followPodcast from '../shared/followPodcast';

exports.list = async (req, res) => {
	const params = req.params || {};
	const query = req.query || {};

	const page = parseInt(query.page, 10) || 0;
	const perPage = parseInt(query.per_page, 10) || 10;

	if (query.type === 'recommended') {
		personalization({
			endpoint: '/winds_user_recommendations',
			userId: req.user.sub,
		})
		.then(users => {
			if (!users.length) {
				res.status(200).json([]);
				return;
			}
			async.filter(
				users,
				(user, cb) => {
					User.findOne({ _id: user, active: true })
						.then(user => {
							if (user) {
								cb(null, true);
							} else {
								cb(null);
							}
						})
						.catch(err => {
							cb(err);
						});
				},
				(err, results) => {
					async.map(
						results,
						(user, cb) => {
							User.findOne({ _id: user, active: true })
								.select(
									'name username email interests background url bio twitter',
								)
								.then(enriched => {
									cb(null, enriched);
								})
								.catch(err => {
									cb(err);
								});
							},
							(err, results) => {
								if (err) {
									logger.error(err);
									return res.status(422).send(err.errors);
								} else {
									res.json(results);
								}
							},
					);
				},
			);
		})
		.catch(err => {
			res.status(503).send(err.response.data);
		});
	} else {
		User.apiQuery(req.query)
			.select('name email username bio url twitter background admin')
			.then(users => {
				res.json(users);
			})
			.catch(err => {
				logger.error(err);
				res.status(422).send(err.errors);
			});
	}
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
	const user = await User.findById(req.params.userId);
	if (!user) {
		res.status(404).send('User not found');
		return;
	}

	user.password = undefined;
	user.recoveryCode = undefined;

	if (req.params.userId !== req.user.sub) {
		user.email = undefined;
	}

	res.json(user);
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

	if (data.interests) {
		const promises = data.interests.flatMap(async (interest) => {
			// find all rss feeds and podcasts for that interest, and follow them
			return [
				RSS.find({interest}).then(rssFeeds => rssFeeds.map(rssFeed => followRssFeed(req.params.userId, rssFeed._id))),
				Podcast.find({interest}).then(podcasts => podcasts.map(podcast => followPodcast(req.params.userId, podcast._id)))
			];
		});
		await Promise.all(promises);
	}

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
