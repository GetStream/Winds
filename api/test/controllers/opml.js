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

// load fixture with follows and feeds
// setup a users
// test the get
// - auth is required
// - verify that the right data is there
// post
// - large files
// - different extensions
// - folder/no folder OPML
// detect feed type codebase
// - various formats

function authGetRequest(getPath) {
	const token = jwt.sign(
		{
			email: 'test+test@test.com',
			sub: '5b0f306d8e147f10f16aceaf',
		},
		config.jwt.secret,
	);
	return request(api)
		.get(getPath)
		.set('Authorization', `Bearer ${token}`);
}

function authPostRequest(path) {
	const token = jwt.sign(
		{
			email: 'test+test@test.com',
			sub: '5b0f306d8e147f10f16aceaf',
		},
		config.jwt.secret,
	);
	return request(api)
		.post(path)
		.set('Authorization', `Bearer ${token}`);
}

describe('OPML', () => {
/*
	describe('Export', () => {
		before(async () => {
			await loadFixture('initialData', 'opml');
		});

		describe('invalid request', () => {
			let response;
			let user;

			before(async () => {
				response = await request(api).get('/opml/download');
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});

		describe('valid request', () => {
			let response;
			let user;

			before(async () => {
				response = await authGetRequest('/opml/download');
			});

			it('should return 200', () => {
				expect(response).to.have.status(200);
				console.log('r', response.body);
			});
		});
	});*/

	describe('Import', () => {
		describe('valid request', () => {
			let response;
			let user;

			before(async () => {
				response = await authPostRequest('/opml/upload').attach(
					'opml',
					fs.readFileSync(path.join(__dirname, '..', 'data', 'test.xml')),
					'test.xml',
				);
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});
	});

	describe('Feed Detection', () => {
		describe('Podcast', async () => {
			let isPodcast

			before(async () => {
				let p = path.join(__dirname, '..', 'data', 'feed', 'giant-bomcast');
				let feedStream = fs.createReadStream(p);
				isPodcast = await IsPodcastStream(
					feedStream,
					'https://giant-bomcast.com/',
				);
			});

			it('giant bomcast should be a podcast', async () => {
				expect(isPodcast).to.be.true;
			});
		});

		describe('RSS', async () => {
			let isPodcast

			before(async () => {
				let p = path.join(__dirname, '..', 'data', 'feed', 'techcrunch');
				let feedStream = fs.createReadStream(p);
				isPodcast = await IsPodcastStream(
					feedStream,
					'https://giant-bomcast.com/',
				);
			});

			it('techcrunch should not be a podcast', async () => {
				expect(isPodcast).to.be.false;
			});
		});
	});
});
