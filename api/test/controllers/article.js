import { expect, request } from 'chai';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import Article from '../../src/models/article';

let withLogin = async (r) => {
	let response = await request(api).post('/auth/login').send({
		email: 'valid@email.com',
		password: 'valid_password',
	});
	const authToken = response.body.jwt
	return r.set('Authorization', `Bearer ${authToken}`)
};

describe('Article controller', () => {
	let article

	before(async () => {
		await loadFixture('example');
		await loadFixture('articles');
		article = await Article.findOne({});
		expect(article).to.not.be.null;
		expect(article.rss).to.not.be.null;
	})

	describe('get', () => {
		it('should match /articles/:articleId', async () => {
			let response = await withLogin(
				request(api).get(`/articles/${article.id}`)
			);
			expect(response).to.have.status(200);
		});
	});

	describe('get parsed article', () => {
		it('should match /articles/:articleId', async () => {
			let response = await withLogin(
				request(api).get(`/articles/${article.id}?type=parsed`)
			);
			expect(response).to.have.status(200);
		});
	});

	describe('list', () => {

	});

});