import { expect, request } from 'chai';
import { withLogin } from '../utils.js';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import RSS from '../../src/models/rss';
import {reset} from '../utils';

describe('RSS controller', () => {
	let rss;

	before(async () => {
		await reset();
		await loadFixture('example', 'articles');
		rss = await RSS.findOne({});
		expect(rss).to.not.be.null;
	});

	describe('get feed', () => {
		it('should return the right rss feed from /rss/:rssId', async () => {
			const response = await withLogin(
				request(api).get(`/rss/${rss._id}`)
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${rss._id}`);
		});
	});
});
