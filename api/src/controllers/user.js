import validator from 'validator';

import User from '../models/user';
import RSS from '../models/rss';
import Podcast from '../models/podcast';

import personalization from '../utils/personalization';

exports.list = async (req, res) => {
	let users = [];

	if (req.query.type === 'recommended') {
		let recommendedUserIds = await personalization({
			endpoint: '/winds_user_recommendations',
			userId: req.user.sub,
		});
		users = await User.find({ _id: { $in: recommendedUserIds } });
	} else {
		users = await User.apiQuery(req.query).select(
			'name email username bio url twitter background admin',
		);
	}
	res.json(users);
};

exports.delete = async (req, res) => {
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

	let user = await User.findById(req.params.userId);
	if (!user) {
		return res.status(404).send('User not found');
	}

	user.password = undefined;
	user.recoveryCode = undefined;

	let serialized = user;
	if (user._id.toString() === req.user.sub) {
		serialized = user.serializeAuthenticatedUser();
	}

	res.json(serialized);
};

exports.put = async (req, res) => {
	if (req.params.userId !== req.user.sub) {
		return res.status(403).json({ error: 'Access denied.' });
	}

	const data = req.body || {};

	if (data.email && !validator.isEmail(data.email)) {
		return res.status(400).json({ error: 'Invalid or malformed email address.' });
	}

	const regex = /^[\w-]+$/;
	if (data.username && !regex.test(data.username)) {
		return res.status(400).json({
			error: 'Usernames must be alphanumeric but can only contain _, . or -.',
		});
	}

	let user = await User.findById(req.params.userId);

	if (!user) {
		return res.sendStatus(404);
	}

	if (data.username) {
		let userByUsername = await User.findOne({ username: data.username });
		if (userByUsername && userByUsername.id != user.id) {
			return res
				.status(409)
				.json({ error: 'A resource with this username already exists' });
		}
	}

	if (data.email) {
		let userByEmail = await User.findOne({ email: data.email });
		if (userByEmail && userByEmail.email != user.email) {
			return res.status(409).send('User with this email already exists');
		}
	}

	const whitelist = Object.assign(
		{},
		...[
			'name',
			'email',
			'username',
			'password',
			'interests',
			'bio',
			'url',
			'twitter',
			'background',
			'preferences',
			'recoveryCode',
			'active',
		].map(key => ({
			[key]: data[key],
		})),
	);

	user = await User.findByIdAndUpdate({ _id: req.params.userId }, data, {
		new: true,
	});

	user.password = undefined;
	user.recoveryCode = undefined;

	res.status(201).json(user);
};
