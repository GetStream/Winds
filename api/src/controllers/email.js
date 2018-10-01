import mongoose from 'mongoose';

import User from '../models/user';

import {
    daylyContextGlobal,
    daylyContextUser,
    weeklyContextGlobal,
    weeklyContextUser
} from '../utils/email/context';
import { CreateDaylyEmail, CreateWeeklyEmail, SendDaylyEmail, SendWeeklyEmail } from '../utils/email/send';

exports.list = async (req, res) => {
	res.json(['daily', 'weekly']);
};

function createEmail(type, user) {
	const create = { dayly: CreateDaylyEmail, weekly: CreateWeeklyEmail };
	const context = { // storing as lambda to defer evaluation
		dayly: () => [ daylyContextGlobal(), daylyContextUser(user) ],
		weekly: () => [ weeklyContextGlobal(), weeklyContextUser(user) ]
	};
	const emailContext = Promise.all(context[type]());
	return create[type](Object.assign({}, ...emailContext));
}

function sendEmail(type, email) {
	const send = { dayly: SendDaylyEmail, weekly: SendWeeklyEmail };
	return send[type](email);
}

exports.get = async (req, res) => {
	if (!['daily', 'weekly'].includes(req.params.emailName)) {
		return;
	}

	const userId = req.query.user;
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: `Invalid user id ${userId}.` });
	}

	const user = await User.findOne({ _id: userId, admin: true });
	const email = createEmail(req.params.emailName, user);

	return res.type('html').send(email.html);
};

exports.post = async (req, res) => {
	if (!['daily', 'weekly'].includes(req.params.emailName)) {
		return;
	}

	const userId = req.query.user;
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: `Invalid user id ${userId}.` });
	}

	const user = await User.findOne({ _id: userId, admin: true });
	const email = createEmail(req.params.emailName, user);
	await sendEmail(req.params.emailName, email);

	return res.status(204);
}
