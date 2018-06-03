import { expect, request } from 'chai';
import { withLogin } from '../utils.js';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import RSS from '../../src/models/rss';
import {reset} from '../utils';

describe('RSS controller', () => {
	let rss;

	before(async () => {
		await reset();
		await loadFixture('example', 'articles');
		rss = await RSS.findOne({});
		expect(rss).to.not.be.null;
	});

	describe('get feed', () => {
		it('should return the right rss feed from /rss/:rssId', async () => {
			const response = await withLogin(
				request(api).get(`/rss/${rss._id}`)
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${rss._id}`);
		});
	});

	describe('get RSS list', () => {
		it('should return the right rss feed from /rss', async () => {
			const response = await withLogin(
				request(api).get('/rss')
			);
			expect(response).to.have.status(200);
			expect(response.body).to.be.a('Array');
		});
	});

	describe('add RSS feed - HN', () => {
		let rss;

		it('should create 1 feed from HN URL', async () => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({'feedUrl': 'https://news.ycombinator.com'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(1);
			expect(response.body[0].url).to.eq('https://news.ycombinator.com');
			rss = await RSS.find({url:'https://news.ycombinator.com'});
		});

		it('2nd time should not create or update anything', async () => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({'feedUrl': 'https://news.ycombinator.com'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(0);

			let rss2 = await RSS.find({url:'https://news.ycombinator.com'});
			expect(rss2.updatedAt).to.eq(rss.updatedAt);
		});

		it('creates 2 RSS feeds for Tech Crunch', async() => {
			const response = await withLogin(
				request(api)
					.post('/rss')
					.send({'feedUrl': 'https://techcrunch.com'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(2);
			let tcRSS = await RSS.find({url:'https://techcrunch.com'});
			expect(tcRSS).to.have.length(2);
		});
	});
});
