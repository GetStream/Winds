import { expect, request } from 'chai';

import api from '../../src/server';
import Podcast from '../../src/models/podcast';
import config from '../../src/config';
import { loadFixture, dropDBs, withLogin, getMockClient } from '../utils.js';

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
			const response = await withLogin(request(api).get('/podcasts'));
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
		});
	});

	describe('get podcast list from personalization', () => {
		it('should return the right podcast feed from /podcasts?type=recommended', async () => {
			const mock = getMockClient();
			const opts = { user_id: '5b0f306d8e147f10f16aceaf', limit: 7 };
			const result = { results: [{ foreign_id: `episode:${podcast.id}` }] };

			mock.personalization.get.withArgs('winds_podcast_recommendations', opts).returns({ data: result });

			const response = await withLogin(
				request(api)
					.get('/podcasts')
					.query({
						type: 'recommended',
					}),
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
			expect(response.body[0].url).to.eq(podcast.url);

			mock.personalization.get.reset();
		});
	});

	describe('get podcast', () => {
		it('should return the right rss feed from /podcasts/:podcastId', async () => {
			const response = await withLogin(
				request(api).get(`/podcasts/${podcast._id}`),
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${podcast._id}`);
		});
	});

	describe('add Podcast', () => {
		let podcast;

		it('should create podcast from https://a16z.com/podcasts/feed/', async () => {
			const response = await withLogin(
				request(api)
					.post('/podcasts')
					.send({ feedUrl: 'https://a16z.com/podcasts/feed/' }),
			);
			expect(response).to.have.status(200);
			expect(response.body).to.have.length(1);
			expect(response.body[0].url).to.eq('https://a16z.com');
			podcast = await Podcast.find({ url: 'https://a16z.com' });
			expect(podcast).to.be.not.null;
		});

		it('2nd time should not create or update anything', async () => {
			const response = await withLogin(
				request(api)
					.post('/podcasts')
					.send({ feedUrl: 'https://a16z.com/podcasts/feed/' }),
			);
			expect(response).to.have.status(200);
			expect(response.body).to.have.length(1);
			const podcast2 = await Podcast.find({ url: 'https://a16z.com' });
			expect(podcast2).to.be.not.null;
			expect(podcast2.updatedAt).to.eq(podcast.updatedAt);
		});
	});
});
