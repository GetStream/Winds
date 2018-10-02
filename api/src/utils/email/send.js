import fs from 'fs';
import ejs from 'ejs';
import sendgrid from '@sendgrid/mail';

import logger from '../logger';
import config from '../../config';

export var DummyEmailTransport = { emails: [] };

export function CreateDailyEmail(data) {
	const msg = ejs.render(
		fs.readFileSync(__dirname + '/templates/daily.ejs', 'utf8'),
		data,
	);

	const obj = {
		to: data.email,
		from: config.email.sender.support.email,
		subject: 'Winds Digest',
		html: msg,
	};

	return obj;
}

export function CreateWeeklyEmail(data) {
	const msg = ejs.render(
		fs.readFileSync(__dirname + '/templates/weekly.ejs', 'utf8'),
		data,
	);

	const obj = {
		to: data.email,
		from: config.email.sender.support.email,
		subject: 'Winds Digest',
		html: msg,
	};

	return obj;
}

export async function SendDailyEmail(data) {
	let obj = CreateDailyEmail(data);
	let res = await SendEmail(obj);
	return res;
}

export async function SendWeeklyEmail(data) {
	let obj = CreateWeeklyEmail(data);
	let res = await SendEmail(obj);
	return res;
}

export async function SendWelcomeEmail(data) {
	const msg = ejs.render(fs.readFileSync(__dirname + '/templates/welcome.ejs', 'utf8'));

	const obj = {
		to: data.email,
		from: config.email.sender.support.email,
		subject: 'Welcome to Winds!',
		html: msg,
	};

	let res = await SendEmail(obj);
	return res;
}

export async function SendPasswordResetEmail(data) {
	const msg = ejs.render(
		fs.readFileSync(__dirname + '/templates/password.ejs', 'utf8'),
		{
			recoveryCode: data.recoveryCode,
		},
	);

	const obj = {
		to: data.email,
		from: config.email.sender.support.email,
		subject: 'Forgot Password',
		html: msg,
	};
	return await SendEmail(obj);
}

export async function SendEmail(obj) {
	if (config.email.backend === 'sendgrid') {
		if (!config.email.sendgrid.secret) {
			throw new Error('Could not send reset email, missing Sendgrid secret.');
		}
		sendgrid.setApiKey(config.email.sendgrid.secret);
		let res = await sendgrid.send(obj);
		return res;
	} else {
		DummyEmailTransport.emails.unshift(obj);
		return obj;
	}
}
