import uuidv4 from 'uuid/v4';
import validator from 'validator';

import User from '../models/user';
import RSS from '../models/rss';
import Podcast from '../models/podcast';
import Follow from '../models/follow';

import config from '../config';
import packageInfo from '../../../app/package.json';

import Redis from 'ioredis';
const cache = new Redis(config.cache.uri);

import { SendPasswordResetEmail, SendWelcomeEmail } from '../utils/email/send';

exports.signup = async (req, res) => {
	const data = Object.assign({}, { interests: [] }, req.body);

	if (!data.name || !data.email || !data.username || !data.password) {
		return res.status(400).json({ error: 'Missing required fields.' });
	}

	if (data.email && !validator.isEmail(data.email)) {
		return res.status(400).json({ error: 'Invalid or malformed email address.' });
	}

	const regex = /^[\w-]+$/;
	if (data.username && !regex.test(data.username)) {
		return res.status(400).json({
			error: 'Usernames must be alphanumeric but can only contain _, . or -.',
		});
	}

	data.username = data.username.trim();
	data.email = data.email.trim();

	const exists = await User.findOne({
		$or: [{ email: data.email }, { username: data.username }],
	});

	if (exists) {
		return res.status(409).json({
			error: 'A resource already exists with that username or email.',
		});
	}

	const whitelist = Object.assign(
		{},
		...['name', 'email', 'username', 'password', 'interests'].map(key => ({
			[key]: data[key],
		})),
	);

	const user = await User.create(whitelist);

	await SendWelcomeEmail({ email: user.email });

	async function interests() {
		const cacheKey = `interests:v${packageInfo.version.replace(/\./g, ':')}`;

		let str = await cache.get(cacheKey);
		let cached = JSON.parse(str);

		if (!cached) {
			let cached = [];

			const query = [
				{ featured: true },
				{ interest: 'UI/UX' },
				{ interest: 'Startups & VC' },
				{ interest: 'Programming' },
				{ interest: 'Gaming' },
				{ interest: 'Machine Learning & AI' },
				{ interest: 'News' },
				{ interest: 'VR' },
				{ interest: 'Lifehacks' },
				{ interest: 'Marketing' },
			];

			const docs = {
				rss: await RSS.find({
					$or: query,
				}),
				podcast: await Podcast.find({
					$or: query,
				}),
			};

			cached = await cache.set(
				cacheKey,
				JSON.stringify([...docs.rss, ...docs.podcast]),
				'EX',
				60 * 30,
			);

			return cached;
		}

		return cached;
	}

	const objs = await interests();
	await Promise.all(
		objs.map(obj => {
			return Follow.getOrCreate(obj.categories.toLowerCase(), user._id, obj._id);
		}),
	);

	res.json(user.serializeAuthenticatedUser());
};

exports.login = async (req, res) => {
	const data = req.body || {};

	if (!data.email || !data.password) {
		return res.status(400).json({ error: 'Missing required fields.' });
	}

	const email = data.email.toLowerCase().trim();
	const user = await User.findOne({ email: email });

	if (!user) {
		return res.status(404).json({ error: 'Resource does not exist.' });
	}

	if (!(await user.verifyPassword(data.password))) {
		return res.status(403).json({ error: 'Invalid password.' });
	}

	res.status(200).send(user.serializeAuthenticatedUser());
};

exports.forgotPassword = async (req, res) => {
	const opts = { new: true };
	const recoveryCode = uuidv4();

	let email = req.body.email.toLowerCase();

	const user = await User.findOneAndUpdate(
		{ email: email },
		{ recoveryCode: recoveryCode },
		opts,
	);

	if (!user) {
		return res.status(404).json({ error: 'Resource could not be found.' });
	}

	await SendPasswordResetEmail({ email: user.email, recoveryCode: user.recoveryCode });

	res.sendStatus(200);
};

exports.resetPassword = async (req, res) => {
	const user = await User.findOneAndUpdate(
		{ email: req.body.email.toLowerCase(), recoveryCode: req.body.recoveryCode },
		{ password: req.body.password },
		{ new: true },
	);

	if (!user) {
		return res.status(404).json({ error: 'Resource could not be found.' });
	}

	res.status(200).send(user.serializeAuthenticatedUser());
};
