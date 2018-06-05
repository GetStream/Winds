import { expect, request } from 'chai';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import Episode from '../../src/models/episode';
import { withLogin } from '../utils.js';
import nock from 'nock';
import config from '../../src/config';

describe('Episode controller', () => {
	let episode;

	before(async () => {
		await loadFixture('initialData');
		episode = await Episode.findOne({});
		expect(episode).to.not.be.null;
		expect(episode.rss).to.not.be.null;
	});

	describe('get', () => {
		it('should return the right article via /episodes/:episodeId', async () => {
			const response = await withLogin(
				request(api).get(`/episodes/${episode._id}`)
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${episode._id}`);
		});
	});

	describe('list', () => {
		it('should return the list of episodes', async () => {
			const response = await withLogin(
				request(api).get('/episodes')
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
		});
	});

	describe('list with recommendations', () => {
		after(function () {
			nock.cleanAll();
		});

		it('should return the list of episodes', async () => {
			nock(config.stream.baseUrl)
				.get(/winds_episode_recommendations/)
				.reply(200, { results: [
					{foreign_id:`episode:${episode.id}`}, {foreign_id:'episode:5ae0c71a0e7cbc4ee14a7c81'}] });


			const response = await withLogin(
				request(api).get('/episodes').query({
					type: 'recommended',
				})
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
			expect(response.body[0].url).to.eq(episode.url);
		});

	});
});
