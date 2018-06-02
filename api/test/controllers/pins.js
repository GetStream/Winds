import { expect, request } from 'chai';
import { withLogin } from '../utils.js';

import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import Pin from '../../src/models/pin';
import Article from '../../src/models/article';
import Episode from '../../src/models/episode';


describe('Pin controller', () => {
	let pin;
	let article;
	let episode;

	before(async () => {
		await loadFixture('initialData', 'pins');

		pin = await Pin.findOne({});
		article = await Article.findOne({});
		episode = await Episode.findOne({});
	});

	describe('get', () => {
		it('should return all pins', async () => {
			const res = await withLogin(
				request(api).get('/pins')
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

	describe('get', () => {
		it('should return a limited number of pins', async () => {
			const res = await withLogin(
				request(api).get('/pins').query({ limit: 1 })
			);
			expect(res).to.have.status(200);
			expect(res.body).to.be.an('array');
		});
	});

	describe('post', () => {
		it('should create an article pin', async () => {
			const res = await withLogin(
				request(api).post('/pins').send({ article: article._id })
			);
			expect(res).to.have.status(200);


		});
	});

	describe('post', () => {
		it('should create an episode pin', async () => {
			const res = await withLogin(
				request(api).post('/pins').send({ episode: episode._id })
			);
			expect(res).to.have.status(200);
		});
	});

	describe('delete', () => {
		it('should delete a pin', async () => {
			const res = await withLogin(
				request(api).delete(`/pins/${pin._id}`)
			);
			expect(res).to.have.status(404);
		});
	});
});
