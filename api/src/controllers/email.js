import mongoose from 'mongoose';

import User from '../models/user';

import {
    dailyContextGlobal,
    dailyContextUser,
    weeklyContextGlobal,
    weeklyContextUser
} from '../utils/email/context';
import { CreateDailyEmail, CreateWeeklyEmail, SendEmail } from '../utils/email/send';

exports.list = async (req, res) => {
	res.json(['daily', 'weekly']);
};

async function createEmail(type, user) {
	const create = { daily: CreateDailyEmail, weekly: CreateWeeklyEmail };
	const context = { // storing as lambda to defer evaluation
		daily: () => [ dailyContextGlobal(), dailyContextUser(user) ],
		weekly: () => [ weeklyContextGlobal(), weeklyContextUser(user) ]
	};
	const emailContext = await Promise.all(context[type]());
	return create[type](Object.assign({}, ...emailContext));
}

exports.get = async (req, res) => {
	if (!['daily', 'weekly'].includes(req.params.emailName)) {
		return res.status(401);
	}

	const userId = req.query.user;
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: `Invalid user id ${userId}.` });
	}

	const user = await User.findOne({ _id: userId, admin: true });
	if (!user) {
		return res.status(404);
	}
	const email = await createEmail(req.params.emailName, user);

	return res.type('html').send(email.html);
};

exports.post = async (req, res) => {
	if (!['daily', 'weekly'].includes(req.params.emailName)) {
		return res.status(401);
	}

	const userId = req.query.user;
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: `Invalid user id ${userId}.` });
	}

	const user = await User.findOne({ _id: userId, admin: true });
	if (!user) {
		return res.status(404);
	}
	const email = await createEmail(req.params.emailName, user);
	const result = await SendEmail(email);

	return res.status(200).json(result);
}
