import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import User from '../models/user';
import RSS from '../models/rss';
import Podcast from '../models/podcast';
import Follow from '../models/follow';

import config from '../config';

let packageInfo;
if (process.env.DOCKER) {
	packageInfo = { version: 'DOCKER' };
} else {
	packageInfo = require('../../../app/package.json');
}

import Redis from 'ioredis';
const cache = new Redis(config.cache.uri);

import { SendPasswordResetEmail, SendWelcomeEmail } from '../utils/email/send';

async function getInterestMap() {
	const cacheKey = `interests:v${packageInfo.version.replace(/\./g, ':')}`;

	let str = await cache.get(cacheKey);
	let interestMap = JSON.parse(str);

	if (!interestMap) {
		interestMap = {};

		const rss = await RSS.findFeatured();
		const podcast = await Podcast.findFeatured();

		for (let p of [...rss, ...podcast]) {
			let k = p.interest || 'featured';
			let d = p.toObject();
			d.type = p.constructor.modelName == 'RSS' ? 'rss' : 'podcast';

			if (!(k in interestMap)) {
				interestMap[k] = [];
			}
			interestMap[k].push(d);
		}

		let cached = await cache.set(
			cacheKey,
			JSON.stringify(interestMap),
			'EX',
			60 * 30,
		);
	}

	return interestMap;
}

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
		...['name', 'email', 'username', 'password', 'interests'].map((key) => ({
			[key]: data[key],
		})),
	);

	const user = await User.create(whitelist);

	let interestMap = await getInterestMap();
	let interestFollow = interestMap['featured'] || [];

	for (let i of data.interests) {
		let publications = interestMap[i];

		if (publications) {
			interestFollow.push(...publications);
		}
	}

	let followCommands = interestFollow.map((interest) => {
		return {
			type: interest.type,
			publicationID: interest._id,
			userID: user._id.toString(),
		};
	});

	await Promise.all([
		Follow.getOrCreateMany(followCommands),
		SendWelcomeEmail({ email: user.email }),
	]);

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
		return res.status(403).json({ error: 'Invalid username or password.' });
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
