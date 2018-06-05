import { expect, request } from 'chai';

import api from '../../src/server';
import User from '../../src/models/user';
import Episode from '../../src/models/episode';
import { dropDBs, getMockClient, createMockFeed, loadFixture, withLogin } from '../utils.js';

describe('Feed controller', () => {
    let user;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		user = await User.findOne({ email: 'valid@email.com' });
		expect(user).to.not.be.null;
	});

	describe('invalid request', () => {
		it('should return 400 if feed type is missing', async () => {
			const response = await withLogin(
				request(api).get(`/users/${user.id}/feeds/`)
			);
			expect(response).to.have.status(400);
		});
		it('should return 400 if feed type is empty', async () => {
			const response = await withLogin(
				request(api).get(`/users/${user.id}/feeds/`).query({ type: '' })
			);
			expect(response).to.have.status(400);
		});
		it('should return 400 if feed type is invalid', async () => {
			const response = await withLogin(
				request(api).get(`/users/${user.id}/feeds/`).query({ type: 'invalid' })
			);
			expect(response).to.have.status(400);
		});
	});

	describe('user feed', () => {
	});

	describe('timeline feed', () => {
	});

	describe('article feed', () => {
	});

	describe('episode feed', () => {
		it('should return episodes from user_episode Stream feed', async () => {
			const episodes = await Episode.find({});
			const userEpisodeFeed = createMockFeed('user_episode', user.id);
			userEpisodeFeed.get.returns(Promise.resolve({
				results: episodes.map(e => {
					return { foreign_id: `episode:${e.id}` };
				}),
			}));

			const response = await withLogin(
				request(api)
					.get(`/users/${user.id}/feeds/`)
					.query({
						type: 'episode',
						page: 1,
						per_page: 42,
					})
			);
			expect(response).to.have.status(200);

			const mockClient = getMockClient();
			expect(mockClient.feed.calledWith('user_episode', user.id)).to.be.true;
			expect(userEpisodeFeed.get.calledWith({ limit: 42, offset: 1 }));
		});
	});
});
