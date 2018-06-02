import { expect, request } from 'chai';

import api from '../../src/server';
import auth from '../../src/controllers/auth';
import Podcast from '../../src/models/podcast';
import RSS from '../../src/models/rss';
import User from '../../src/models/user';
import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';
import fs from 'fs';
import path from 'path';
import FeedParser from 'feedparser';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import { IsPodcastStream } from '../../src/parsers/detect-type';
import { ParseOG } from '../../src/parsers/og';

function getTestPage(name) {
	let p = path.join(__dirname, '..', 'data', 'og', name);
	let feedStream = fs.createReadStream(p);
	return feedStream;
}

describe('OG parsing', () => {

	describe.only('valid request', () => {
		let response;
		let user;

		it('should detect og image from techcrunch', async () => {
			let tc = getTestPage('techcrunch.html');
      let result = await ParseOG(tc)
      console.log(result)



		});
	});
});
