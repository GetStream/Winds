import { expect, request } from 'chai';
import fs from 'fs';
import path from 'path';

import api from '../../src/server';
import { IsPodcastStream } from '../../src/parsers/detect-type';
import { withLogin, loadFixture, dropDBs } from '../utils';

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

// edge cases
// - what if a feed URL is somehow broken (check)
// - what if the feed is too large (more than 5MB, check)
// - what if you upload a file that's too large (check)
// - what if the site URL is not valid (check)
// - what if you already follow a certain feed

function AuthGetRequest(getPath) {
	return withLogin(request(api).get(getPath));
}

function AuthPostRequest(path) {
	return withLogin(request(api).post(path));
}

describe('OPML', () => {
	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'opml', 'featured');
	});

	describe('Export', () => {
		describe('invalid request', () => {
			let response;

			before(async () => {
				response = await request(api).get('/opml/download');
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});

		describe('valid request', () => {
			let response;

			before(async () => {
				response = await AuthGetRequest('/opml/download');
			});

			it('should return 200', () => {
				expect(response).to.have.status(200);
			});
		});
	});

	describe('Import', () => {
		describe('valid request', () => {
			let response;

			before(async () => {
				response = await AuthPostRequest('/opml/upload').attach(
					'opml',
					fs.readFileSync(path.join(__dirname, '..', 'data', 'test.xml')),
					'test.xml',
				);
			});

			it('should return 200', () => {
				expect(response).to.have.status(200);
				expect(response).to.be.json;
				expect(response.body.length).to.equal(2);
				expect(response.body[0].follow.user).to.equal('5b0f306d8e147f10f16aceaf');
				expect(response.body[0].follow.rss).to.be.undefined;
				expect(response.body[1].follow.user).to.equal('5b0f306d8e147f10f16aceaf');
				expect(response.body[1].follow.podcast).to.be.undefined;
			});
		}).retries(10);

		describe('invalid request', () => {
			it('should return 200', async () => {
				const response = await AuthPostRequest('/opml/upload').attach(
					'opml',
					fs.readFileSync(path.join(__dirname, '..', 'data', '404.opml')),
					'404.opml',
				);
				expect(response).to.have.status(200);
				expect(response).to.be.json;
				expect(response.body.length).to.equal(2);
				expect(response.body[0].follow.user).to.equal('5b0f306d8e147f10f16aceaf');
				expect(response.body[1].error).to.equal('Error opening https://kotaku.com/rss404');
			}).retries(3);

			it('should return 200', async () => {
				const response = await AuthPostRequest('/opml/upload').attach(
					'opml',
					fs.readFileSync(path.join(__dirname, '..', 'data', 'not-a-url.opml')),
					'not-a-url.opml',
				);
				expect(response).to.have.status(200);
				expect(response).to.be.json;
				expect(response.body.length).to.equal(2);
				expect(response.body[0].follow.user).to.equal('5b0f306d8e147f10f16aceaf');
				expect(response.body[1].error).to.equal('Invalid feedUrl https://kotaku/rss404');
			}).retries(3);
		});
	});

	describe('Feed Detection', () => {
		describe('Podcast', async () => {
			let isPodcast;

			before(async () => {
				let p = path.join(
					__dirname,
					'..',
					'data',
					'podcast-feed',
					'giant-bombcast',
				);
				let feedStream = fs.createReadStream(p);
				isPodcast = await IsPodcastStream(
					feedStream,
					'https://giant-bomcast.com/',
				);
			});

			it('giant bomcast should be a podcast', async () => {
				expect(isPodcast).to.be.true;
			});

			it('design details should be a podcast', async () => {
				let p = path.join(
					__dirname,
					'..',
					'data',
					'podcast-feed',
					'design-details',
				);
				let feedStream = fs.createReadStream(p);
				isPodcast = await IsPodcastStream(
					feedStream,
					'https://spec.fm/podcasts/design-details',
				);
				expect(isPodcast).to.be.true;
			});
		});

		describe('RSS', async () => {
			let isPodcast;

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
