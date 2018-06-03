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
import { ParseOG, ParseOGStream } from '../../src/parsers/og';

function getTestPage(name) {
	let p = path.join(__dirname, '..', 'data', 'og', name);
	let feedStream = fs.createReadStream(p);
	return feedStream;
}

describe('OG parsing', () => {
	let response;
	let user;

	// // TODO:
	// - different charset
	// - gzip

	it('should not detect og image from google', async () => {
		let tc = getTestPage('google.html');
		let result = await ParseOGStream(tc);
		expect(result).to.equal(null);
	});

	it('should detect og image from techcrunch', async () => {
		let tc = getTestPage('techcrunch.html');
		let result = await ParseOGStream(tc);
		let ogImage =
			'https://techcrunch.com/wp-content/uploads/2018/06/wwdc-2018-logo.jpg?w=585';
		expect(result).to.equal(ogImage);
	});

	it('should detect og image from techcrunch part 2', async () => {
		let result = await ParseOGStream(getTestPage('techcrunch_instagram.html'));
		let ogImage = 'https://techcrunch.com/wp-content/uploads/2018/06/instagram-algorithm.png?w=753';
		expect(result).to.equal(ogImage);
	});

	it('should not detect og image from broken techcrunch', async () => {
		let tc = getTestPage('techcrunch_broken.html');
		let result = await ParseOGStream(tc);
		expect(result).to.equal(null);
	});



});
