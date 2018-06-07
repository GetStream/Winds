import fs from 'fs';
import ejs from 'ejs';
import sendgrid from '@sendgrid/mail';

import logger from '../logger';
import config from '../../config';

export var DummyEmailTransport = {'emails': []}


export async function SendWelcomeEmail(data) {
	const msg = ejs.render(fs.readFileSync(__dirname + '/templates/welcome.ejs', 'utf8'));

	const obj = {
		to: data.email,
		from: {
			name: config.email.sender.default.name,
			email: config.email.sender.default.email,
		},
		subject: 'Welcome to Winds!',
		content: [
			{
				type: 'text/html',
				value: msg,
			},
		],
	};

	let res = await SendEmail(obj)
	return res
}

export async function SendPasswordResetEmail(data) {
	const msg = ejs.render(fs.readFileSync(__dirname + '/templates/password.ejs', 'utf8'), {
		passcode: data.passcode,
	});

	const obj = {
		to: data.email,
		from: {
			name: config.email.sender.support.name,
			email: config.email.sender.support.email,
		},
		subject: 'Forgot Password',
		content: [
			{
				type: 'text/html',
				value: msg,
			},
		],
	};
	let res = await SendEmail(obj)
	return res
}

export async function SendEmail(obj) {
	if (config.env !== 'production') {
		DummyEmailTransport.emails.unshift(obj)
		return obj
	} else {
		if (!config.email.sendgrid.secret) {
			logger.error(`couldnt find sendgrid secret, email send failing`)
		}
		sendgrid.setApiKey(config.email.sendgrid.secret);
		let res = await sendgrid.send(obj)
		return res
	}
}
