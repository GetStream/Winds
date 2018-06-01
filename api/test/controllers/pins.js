import { expect, request } from 'chai';
import jwt from 'jsonwebtoken';

import api from '../../src/server';
import config from '../../src/config';
import { loadFixture } from '../../src/utils/test';
import Pin from '../../src/models/pin';
import User from '../../src/models/user';
import Article from '../../src/models/article';
import Episode from '../../src/models/episode';

function withLogin(r) {
	const authToken = jwt.sign({
		email: 'valid@email.com',
		sub: '5b0f306d8e147f10f16aceaf',
	}, config.jwt.secret);
	return r.set('Authorization', `Bearer ${authToken}`)
};

describe.only('Pin controller', () => {
    let pin;
    let user;
    let article;
    let episode;

	before(async () => {
		await loadFixture('initialData', 'pins', 'articles');

        pin = await Pin.findOne({});
        user = await User.findOne({});
        article = await Article.findOne({});
        episode = await Episode.findOne({});
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
				request(api).post('/pins').send({ article: article._id, user: user._id })
			);
			expect(res).to.have.status(200);
		});
	});

    describe('post', () => {
		it('should create an episode pin', async () => {
			const res = await withLogin(
				request(api).post('/pins').send({ episode: episode._id, user: user._id })
			);
			expect(res).to.have.status(200);
		});
	});
});
