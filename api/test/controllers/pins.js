import { expect, request } from 'chai';
import jwt from 'jsonwebtoken';

import api from '../../src/server';
import config from '../../src/config';
import { loadFixture } from '../../src/utils/test';
import Pin from '../../src/models/pin';

function withLogin(r) {
	const authToken = jwt.sign({
		email: 'valid@email.com',
		sub: '5b0f306d8e147f10f16aceaf',
	}, config.jwt.secret);
	return r.set('Authorization', `Bearer ${authToken}`)
};

describe.only('Pin controller', () => {
	let pin;

	before(async () => {
		await loadFixture('example');
        await loadFixture('pins');
	});

    describe('get', () => {
		it('should return all pins', async () => {
			const res = await withLogin(
				request(api).get(`/pins`)
			);
			expect(res).to.have.status(200);
		});
	});

	describe('get', () => {
		it('should return the a single pin via /pins/:pinId', async () => {
			const res = await withLogin(
				request(api).get(`/pins/${pin._id}`)
			);
			expect(res).to.have.status(200);
		});
	});

	describe('list', () => {
		it('should return a limited number of pins', async () => {
			const res = await withLogin(
				request(api).get('/pins').query({ limit: 1 })
			);
			expect(res).to.have.status(200);
            expect(res).to.be.an('array');
		});
	});
});
