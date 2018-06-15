import fs from 'fs';
import ejs from 'ejs';
import sendgrid from '@sendgrid/mail';

import logger from '../logger';
import config from '../../config';

export var DummyEmailTransport = { emails: [] };

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
	if (config.env !== 'production') {
		DummyEmailTransport.emails.unshift(obj);
		return obj;
	} else {
		if (!config.email.sendgrid.secret) {
			throw new Error('Could not send reset email, missing Sendgrid secret.');
		}
		sendgrid.setApiKey(config.email.sendgrid.secret);
		let res = await sendgrid.send(obj);
		return res;
	}
}
