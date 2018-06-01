import { expect, request } from 'chai';
import jwt from 'jsonwebtoken';

import api from '../../src/server';
import config from '../../src/config';
import { loadFixture } from '../../src/utils/test';
import Article from '../../src/models/article';

function withLogin(r) {
	const authToken = jwt.sign({
		email: 'valid@email.com',
		sub: '5b0f306d8e147f10f16aceaf',
	}, config.jwt.secret);
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
		it('should return the right article via /articles/:articleId', async () => {
			const response = await withLogin(
				request(api).get(`/articles/${article.id}`)
			);
			expect(response).to.have.status(200);
		});
	});

	describe('get parsed article', () => {
		it('should return the parsed version of the article', async () => {
			const response = await withLogin(
				request(api).get(`/articles/${article.id}?type=parsed`)
			);
			expect(response).to.have.status(200);
		});
	});

	describe('list', () => {
		it('should return the list of articles', async () => {
			const response = await withLogin(
				request(api).get('/articles')
			);
			expect(response).to.have.status(200);
		});
	});
});
