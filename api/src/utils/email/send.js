import fs from 'fs';
import ejs from 'ejs';
import sendgrid from '@sendgrid/mail';

import logger from '../logger';
import config from '../../config';

export var DummyEmailTransport = { emails: [] };

console.log('config', config.email.sender.default);

export async function SendWelcomeEmail(data) {
	const msg = ejs.render(fs.readFileSync(__dirname + '/templates/welcome.ejs', 'utf8'));

	const obj = {
		to: data.email,
		from: config.email.sender.default.email,
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
			passcode: data.passcode,
		},
	);

	const obj = {
		to: data.email,
		from: config.email.sender.support.email,
		subject: 'Forgot Password',
		html: msg,
	};
	let res = await SendEmail(obj);
	return res;
}

export async function SendEmail(obj) {
	if (config.env !== 'production') {
		DummyEmailTransport.emails.unshift(obj);
		return obj;
	} else {
		if (!config.email.sendgrid.secret) {
			logger.error(`couldnt find sendgrid secret, email send failing`);
		}
		sendgrid.setApiKey(config.email.sendgrid.secret);
		let res;
		res = await sendgrid.send(obj);
		return res;
	}
}
