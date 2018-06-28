import { expect, request } from 'chai';

import api from '../../src/server';
import User from '../../src/models/user';
import Episode from '../../src/models/episode';
import Article from '../../src/models/article';
import {
	dropDBs,
	getMockClient,
	createMockFeed,
	loadFixture,
	withLogin,
} from '../utils.js';

describe('Feed controller', () => {
	let user;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'liked-shares');
		user = await User.findOne({ email: 'valid@email.com' });
		expect(user).to.not.be.null;
	});

	describe('invalid request', () => {
		it('should return 400 if feed type is missing', async () => {
			const response = await withLogin(
				request(api).get(`/users/${user.id}/feeds/`),
			);
			expect(response).to.have.status(400);
		});
		it('should return 400 if feed type is empty', async () => {
			const response = await withLogin(
				request(api)
					.get(`/users/${user.id}/feeds/`)
					.query({ type: '' }),
			);
			expect(response).to.have.status(400);
		});
		it('should return 400 if feed type is invalid', async () => {
			const response = await withLogin(
				request(api)
					.get(`/users/${user.id}/feeds/`)
					.query({ type: 'invalid' }),
			);
			expect(response).to.have.status(400);
		});
		it('should return 404 if user id is invalid', async () => {
			for (const type of ['user', 'timeline', 'article', 'episode']) {
				const response = await withLogin(
					request(api)
						.get('/users/<bogus-id>/feeds/')
						.query({ type }),
				);
				expect(response).to.have.status(404);
			}
		});
	});

	const feeds = { article: Article, episode: Episode };
	for (const type in feeds) {
		describe(`${type} feed`, () => {
			let response;
			let content;
			let userFeed;

			before(async () => {
				content = await feeds[type].find({});
				userFeed = createMockFeed(`user_${type}`, user.id);
				userFeed.get.returns(
					Promise.resolve({
						results: content.map(c => {
							return { foreign_id: `article:${c.id}` };
						}),
					}),
				);

				response = await withLogin(
					request(api)
						.get(`/users/${user.id}/feeds/`)
						.query({ type, page: 1, per_page: 42 }),
				);
			});

			it('should return 200', () => {
				expect(response).to.have.status(200);
			});

			it(`should return ${type}s from user_${type} Stream feed`, async () => {
				const mockClient = getMockClient();
				expect(mockClient.feed.calledWith(`user_${type}`, user.id)).to.be.true;
				expect(userFeed.get.calledWith({ limit: 42, offset: 1 }));

				//XXX: validating only ids since mocha deep comparison crashes node with OOM
				for (const entity of response.body) {
					expect(content.map(s => String(s._id))).to.include(entity._id);
				}
			});
		});
	}
});
