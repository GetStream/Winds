import nock from 'nock';
import { expect, request } from 'chai';

import api from '../../src/server';
import RSS from '../../src/models/rss';
import config from '../../src/config';
import { loadFixture, withLogin, dropDBs } from '../utils';

describe('RSS controller', () => {
	let rss;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'articles');
		rss = await RSS.findOne({});
		expect(rss).to.not.be.null;
	});

	describe('get feed', () => {
		it('should return the right rss feed from /rss/:rssId', async () => {
			const response = await withLogin(request(api).get(`/rss/${rss._id}`));
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${rss._id}`);
		});
	});

	describe('get RSS list', () => {
		after(function() {
			nock.cleanAll();
		});

		it('should return the right rss feed from /rss', async () => {
			const response = await withLogin(request(api).get('/rss'));
			expect(response).to.have.status(200);
			expect(response.body).to.be.a('Array');
		});

		it('should return the right rss feed from /podcasts?type=recommended', async () => {
			nock(config.stream.baseUrl)
				.get(/winds_rss_recommendations/)
				.reply(200, {
					results: [
						{ foreign_id: `rss:${rss.id}` },
						{ foreign_id: 'rss:5ae0c71a0e7cbc4ee14a7c81' },
					],
				});

			const response = await withLogin(
				request(api)
					.get('/rss')
					.query({
						type: 'recommended',
					}),
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
			expect(response.body[0].url).to.eq(rss.url);
		});
	});

	describe('add road to VR', () => {
		let rss;

		it('should create 3 feed from Road to VR', async () => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({ feedUrl: 'https://www.roadtovr.com/' }),
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(3);
			expect(response.body[0].url).to.eq('https://roadtovr.com');
			rss = await RSS.find({ url: 'https://roadtovr.com' });
		});
	});

	describe('add RSS feed - HN', () => {
		let rss;

		it('should create 1 feed from HN URL', async () => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({ feedUrl: 'https://news.ycombinator.com' }),
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(1);
			expect(response.body[0].url).to.eq('https://news.ycombinator.com');
			rss = await RSS.find({ url: 'https://news.ycombinator.com' });
		});

		it('2nd time shoudl still return a response', async () => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({ feedUrl: 'https://news.ycombinator.com' }),
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(1);

			let rss2 = await RSS.find({ url: 'https://news.ycombinator.com' });
			// but not be updated
			expect(rss2.updatedAt).to.eq(rss.updatedAt);
		});

		it('creates 2 RSS feeds for Tech Crunch', async () => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({ feedUrl: 'https://techcrunch.com' }),
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(2);
			let tcRSS = await RSS.find({ url: 'https://techcrunch.com' });
			expect(tcRSS).to.have.length(2);
		});
	});
});
