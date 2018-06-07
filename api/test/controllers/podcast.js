import nock from 'nock';
import { expect, request } from 'chai';

import api from '../../src/server';
import Podcast from '../../src/models/podcast';
import config from '../../src/config';
import { loadFixture, dropDBs, withLogin } from '../utils.js';

describe('Podcast controller', () => {
	let podcast;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		podcast = await Podcast.findOne({});
		expect(podcast).to.not.be.null;
	});

	describe('get podcast list', () => {
		it('should return the right podcast feed from /podcasts', async () => {
			const response = await withLogin(
				request(api).get('/podcasts')
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
		});
	});

	describe('get podcast list from personalization', () => {
		after(function () {
			nock.cleanAll();
		});

		it('should return the right podcast feed from /podcasts?type=recommended', async () => {
			nock(config.stream.baseUrl)
				.get(/winds_podcast_recommendations/)
				.reply(200, { results: [{foreign_id:`episode:${podcast.id}`}] });

			const response = await withLogin(
				request(api).get('/podcasts').query({
					type: 'recommended',
				})
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
			expect(response.body[0].url).to.eq(podcast.url);
		});
	});

	describe('get podcast', () => {
		it('should return the right rss feed from /podcasts/:podcastId', async () => {
			const response = await withLogin(
				request(api).get(`/podcasts/${podcast._id}`)
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${podcast._id}`);
		});
	});

	describe('add Podcast', () => {
		let podcast;

		it('should create podcast from thetwentyminutevc.libsyn.com/rss', async () => {
			const response = await withLogin(
				request(api)
					.post('/podcasts')
					.send({feedUrl: 'http://thetwentyminutevc.libsyn.com/rss'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(1);
			expect(response.body[0].url).to.eq('http://thetwentyminutevc.com');
			podcast = await Podcast.find({url:'http://thetwentyminutevc.com'});
		});

		it('2nd time should not create or update anything', async () => {
			const response = await withLogin(
				request(api)
					.post('/podcasts')
					.send({feedUrl: 'http://thetwentyminutevc.libsyn.com/rss'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(1);

			let podcast2 = await Podcast.find({url:'http://thetwentyminutevc.com'});
			expect(podcast2.updatedAt).to.eq(podcast.updatedAt);
		});

	});
});
