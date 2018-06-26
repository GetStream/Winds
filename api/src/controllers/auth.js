import uuidv4 from 'uuid/v4';
import validator from 'validator';

import User from '../models/user';
import Podcast from '../models/podcast';
import RSS from '../models/rss';
import Follow from '../models/follow';

import config from '../config';

import { SendPasswordResetEmail, SendWelcomeEmail } from '../utils/email/send';

async function followInterest(userId, interest) {
	const interestRssFeeds = await RSS.find(interest);

	await Promise.all(
		interestRssFeeds.map(interestRssFeed => {
			return Follow.getOrCreate('rss', userId, interestRssFeed._id);
		}),
	);

	const interestPodcasts = await Podcast.find(interest);
	await Promise.all(
		interestPodcasts.map(interestPodcast => {
			return Follow.getOrCreate('podcast', userId, interestPodcast._id);
		}),
	);
}

function cleanString(s) {
	return s.toLowerCase().trim();
}

exports.signup = async (req, res, _) => {
	const data = Object.assign({}, { interests: [] }, req.body);

	if (!data.name || !data.email || !data.username || !data.password) {
		return res.status(400).json({ error: 'Missing required fields.' });
	}

	if (data.email && !validator.isEmail(data.email)) {
		return res.status(422).json({ error: 'Invalid or malformed email address.' });
	}

	if (data.username && !validator.isAlphanumeric(data.username)) {
		return res.status(400).json({ error: 'Usernames must be alphanumeric.' });
	}

	data.username = cleanString(data.username);
	data.email = cleanString(data.email);

	const exists = await User.findOne({
		$or: [{ email: data.email }, { username: data.username }],
	});

	if (exists) {
		res.status(409).send('A user already exists with that username or email.');
		return;
	}

	const whitelist = Object.assign(
		{},
		...['name', 'email', 'username', 'password', 'interests'].map(key => ({
			[key]: data[key],
		})),
	);

	const user = await User.create(whitelist);

	await SendWelcomeEmail({ email: user.email });
	await followInterest(user._id, { featured: true });

	await Promise.all(
		data.interests.map(interest => {
			return followInterest(user._id, { interest });
		}),
	);

	res.json(user.serializeAuthenticatedUser());
};

exports.login = async (req, res, _) => {
	const data = req.body || {};

	if (!data.email || !data.password) {
		return res.status(400).json({ error: 'Missing required fields.' });
	}

	const email = cleanString(data.email.toLowerCase());
	const user = await User.findOne({ email: email });

	if (!user) {
		return res.status(404).json({ error: 'Resource does not exist.' });
	}

	if (!(await user.verifyPassword(data.password))) {
		return res.status(403).json({ error: 'Invalid password.' });
	}

	res.status(200).send(user.serializeAuthenticatedUser());
};

exports.forgotPassword = async (req, res, _) => {
	const opts = { new: true };
	const recoveryCode = uuidv4();

	let email = req.body.email.toLowerCase();

	const user = await User.findOneAndUpdate(
		{ email: email },
		{ recoveryCode: recoveryCode },
		opts,
	);

	if (!user) {
		return res.status(404).json({ error: 'User could not be found.' });
	}

	await SendPasswordResetEmail({ email: user.email, recoveryCode: user.recoveryCode });

	res.sendStatus(200);
};

exports.resetPassword = async (req, res, _) => {
	const user = await User.findOneAndUpdate(
		{ email: req.body.email.toLowerCase(), recoveryCode: req.body.recoveryCode },
		{ password: req.body.password },
		{ new: true },
	);

	if (!user) {
		return res.status(404).json({ error: 'User could not be found.' });
	}

	res.status(200).send(user.serializeAuthenticatedUser());
};
