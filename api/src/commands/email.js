import '../loadenv';
import '../utils/db';
import program from 'commander';
import logger from '../utils/logger';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';
import Follow from '../models/follow';
import RSS from '../models/rss';
import Pin from '../models/pin';
import User from '../models/user';
import { SendWeeklyEmail, CreateWeeklyEmail } from '../utils/email/send';
import { weeklyContextGlobal, weeklyContextUser } from '../utils/email/context';

import asyncTasks from '../asyncTasks';
import config from '../config';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as personalization from '../utils/personalization';

program.option('--send', 'Actually send the email').parse(process.argv);

async function main() {
	logger.info(`time to send article recommendations, \\0/`);

	// prep the data we need for everyone
	let globalContext = await weeklyContextGlobal();

	let users = await User.find({});
	let enabledUsers = users.filter(u => {
		return u.weeklyEmail || u.admin;
	});
	logger.info(`going to email ${enabledUsers.length} users`);
	for (const u of enabledUsers) {
		let userContext = await weeklyContextUser(u);
		let context = Object.assign({}, userContext, globalContext);
		let obj = CreateWeeklyEmail(context);
		logger.info(`email ${obj.html}`);
		if (program.send) {
			logger.info(`sending email, yee to user ${u.email}`);
			SendWeeklyEmail(context);
		}
	}
}

main()
	.then(result => {
		logger.info('all done sending emails');
	})
	.catch(err => {
		logger.info(`failed with err ${err}`, { err });
	});
