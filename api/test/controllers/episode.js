import { expect, request } from 'chai';

import api from '../../src/server';
import Episode from '../../src/models/episode';
import config from '../../src/config';
import { withLogin, dropDBs, loadFixture, getMockClient } from '../utils';

describe('Episode controller', () => {
	let episode;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		episode = await Episode.findOne({});
		expect(episode).to.not.be.null;
		expect(episode.rss).to.not.be.null;
	});

	describe('get', () => {
		it('should return the right article via /episodes/:episodeId', async () => {
			const response = await withLogin(
				request(api).get(`/episodes/${episode._id}`),
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${episode._id}`);
		});
	});

	describe('get parsed episode', () => {
		it('should return the parsed version of the episode', async () => {
			const response = await withLogin(
				request(api)
					.get(`/episodes/${episode._id}`)
					.query({ type: 'parsed' }),
			);
			expect(response).to.have.status(200);
		});
	});

	describe('list', () => {
		it('should return the list of episodes', async () => {
			const response = await withLogin(request(api).get('/episodes'));
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
		});
	});

	describe('list with recommendations', () => {
		it('should return the list of episodes', async () => {
			const mock = getMockClient();
			const opts = { user_id: '5b0f306d8e147f10f16aceaf', limit: 20 };
			const result = {
				results: [
					{ foreign_id: `episode:${episode.id}` },
					{ foreign_id: 'episode:5ae0c71a0e7cbc4ee14a7c81' },
				],
			};

			mock.personalization.get
				.withArgs('winds_episode_recommendations', opts)
				.returns({ data: result });

			const response = await withLogin(
				request(api)
					.get('/episodes')
					.query({
						type: 'recommended',
					}),
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
			expect(response.body[0].url).to.eq(episode.url);

			mock.personalization.get.reset();
		});
	});
});
