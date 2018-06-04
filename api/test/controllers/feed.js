import { expect, request } from 'chai';

import api from '../../src/server';
import User from '../../src/models/user';
import { loadFixture, withLogin } from '../utils.js';

describe('Feed controller', () => {
    let user;

	before(async () => {
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
	});
});
