import { expect, request } from 'chai';

import api from '../../src/server';

import { loadFixture, withLogin, dropDBs } from '../utils';

describe('Health controller', () => {
	let pin;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'health');
	});

	describe('get', () => {
		it('should return all pins', async () => {
			const res = await withLogin(request(api).get('/pins'));
			expect(res).to.have.status(200);
		});
	});
});
