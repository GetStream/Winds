import { expect, request } from 'chai';

import api from '../../src/server';

import { loadFixture, withLogin, dropDBs } from '../utils';

describe('Health controller', () => {
	let health;

	before(async () => {
		await dropDBs();
	});

	describe('get', () => {
		it('should return health status of the api', async () => {
			const res = await request(api).get('/health');
			expect(res).to.have.status(200);
		});

		it('should return the status of the api and workers', async () => {
			const res = await request(api).get('/status');
			expect(res).to.have.status(200);
		});

		it('should return the status of the worker queue', async () => {
			const res = await request(api).get('/queue');
			expect(res).to.have.status(200);
		});
	});
});
