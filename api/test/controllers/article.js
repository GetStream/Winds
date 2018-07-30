import { expect, request } from 'chai';

import api from '../../src/server';
import Article from '../../src/models/article';
import config from '../../src/config';
import { dropDBs, loadFixture, withLogin, getMockClient } from '../utils.js';

describe('Article controller', () => {
	let article;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'articles');
		article = await Article.findOne({});
		expect(article).to.not.be.null;
		expect(article.rss).to.not.be.null;
	});

	describe('get', () => {
		it('should return the right article via /articles/:articleId', async () => {
			let response = await withLogin(request(api).get(`/articles/${article.id}`));
			expect(response).to.have.status(200);
		});
	});

	describe('get parsed article', () => {
		it('should return the parsed version of the article', async () => {
			const response = await withLogin(
				request(api)
					.get(`/articles/${article.id}`)
					.query({ type: 'parsed' }),
			);
			expect(response).to.have.status(200);
		});
	});

	describe('list', () => {
		it('should return the list of articles', async () => {
			let response = await withLogin(request(api).get('/articles'));
			expect(response).to.have.status(200);
		});
	});

	describe('list from personalization', () => {
		it('should return the list of articles', async () => {
			const mock = getMockClient();
			const opts = { user_id: '5b0f306d8e147f10f16aceaf', limit: 20 };
			const result = { results: [{ foreign_id: `article:${article.id}` }] };

			mock.personalization.get.withArgs('winds_article_recommendations', opts).returns({ data: result });

			const response = await withLogin(
				request(api)
					.get('/articles')
					.query({
						type: 'recommended',
					}),
			);
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.at.least(1);
			expect(response.body[0].url).to.eq(article.url);

			mock.personalization.get.reset();
		});
	});
});
