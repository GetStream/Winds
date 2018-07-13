import { expect, request } from 'chai';

import api from '../../src/server';
import Pin from '../../src/models/pin';
import Article from '../../src/models/article';
import Episode from '../../src/models/episode';
import { loadFixture, withLogin, dropDBs } from '../utils';

describe('Pin controller', () => {
	let pin;
	let article;
	let episode;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'pins');

		pin = (await Pin.find()
			.sort('_id')
			.limit(1))[0];
		article = (await Article.find()
			.sort('_id')
			.limit(1))[0];
		episode = (await Episode.find()
			.sort('_id')
			.limit(1))[0];
	});

	describe('get', () => {
		it('should return all pins', async () => {
			const res = await withLogin(request(api).get('/pins'));
			expect(res).to.have.status(200);
		});
	});

	describe('get', () => {
		it('should return the a single pin via /pins/:pinId', async () => {
			const res = await withLogin(request(api).get(`/pins/${pin._id}`));
			expect(res).to.have.status(200);
		});
	});

	describe('get', () => {
		it('should return a limited number of pins', async () => {
			const res = await withLogin(
				request(api)
					.get('/pins')
					.query({ limit: 1 }),
			);
			expect(res).to.have.status(200);
			expect(res.body).to.be.an('array');
		});
	});

	describe('post', () => {
		it('should create an article pin and return the hydrated article', async () => {
			const res = await withLogin(
				request(api)
					.post('/pins')
					.send({ article: article._id }),
			);
			expect(res).to.have.status(200);
			expect(res.body).to.have.property('article');
		});
	});

	describe('post', () => {
		it('should create an episode pin and return a hydrated episode', async () => {
			const res = await withLogin(
				request(api)
					.post('/pins')
					.send({ episode: episode._id }),
			);
			expect(res).to.have.status(200);
			expect(res.body).to.have.property('episode');
		});
	});

	describe('delete', () => {
		it('should delete a pin', async () => {
			const res = await withLogin(request(api).delete(`/pins/${pin._id}`));
			expect(res).to.have.status(204);
		});
	});
});
