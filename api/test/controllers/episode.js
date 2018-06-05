import { expect, request } from 'chai';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import Episode from '../../src/models/episode';
import { withLogin } from '../utils.js';

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
		});
	});

	describe('list', () => {
		it('should return the list of episodes', async () => {
			const response = await withLogin(
				request(api).get('/episodes')
			);
			expect(response).to.have.status(200);
		});
	});

	describe('list with recommendations', () => {
		it('should return the list of episodes', async () => {
			const response = await withLogin(
				request(api).get('/episodes')
			);
			expect(response).to.have.status(200);
		});
	});
});
