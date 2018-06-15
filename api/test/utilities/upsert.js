import { expect } from 'chai';
import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import Follow from '../../src/models/follow';

import Pin from '../../src/models/pin';
import Article from '../../src/models/article';

import logger from '../../src/utils/logger';

import { loadFixture, getMockClient, getMockFeed, dropDBs } from '../utils';
import { postChanged, upsertManyPosts } from '../../src/utils/upsert';

describe('Upsert', () => {
	let article1, article2;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		article1 = await Article.findOne({ _id: '5b0ad37226dc3db38194e5ec' });
		article2 = await Article.findOne({ _id: '5b0ad37226dc3db38194e5ed' });
	});

	describe('upsertManyPosts', () => {
		it('the same article shouldnt trigger an update', async () => {
			let operationMap = await upsertManyPosts(article1.rss, [article1], 'rss');
			expect(operationMap.changed.length).to.equal(0);
      expect(operationMap.new.length).to.equal(0);
		});
		it('url change should result in an update', async () => {
			article1.url = 'https://google.com/test';
			let operationMap = await upsertManyPosts(article1.rss, [article1], 'rss');
			expect(operationMap.changed.length).to.equal(1);
      expect(operationMap.new.length).to.equal(0);
		});
		it('publicationDate change shouldnt result in an update', async () => {
			article1.publicationDate = new Date();
			let operationMap = await upsertManyPosts(article1.rss, [article1], 'rss');
			expect(operationMap.changed.length).to.equal(0);
      expect(operationMap.new.length).to.equal(0);
		});
		it('a new article should be inserted', async () => {
      let article3 = article1
			article3.fingerprint = 'hello world';
			article3['_id'] = null
			article3.url = 'https://google.com/testhelloworld';
			let operationMap = await upsertManyPosts(article1.rss, [article3], 'rss');
			expect(operationMap.new.length).to.equal(1);
		});
	});

	describe('postChanged diff function', () => {
		it('the diff between these 2 articles should be 4', async () => {
			let changes = postChanged(article1, article2);
			expect(changes).to.equal(4);
		});
		it('the diff between these 2 articles should be 0', async () => {
			let changes = postChanged(article1, article1);
			expect(changes).to.equal(0);
		});
		it('test if we ignore publication date', async () => {
			let article3 = Object.assign({}, article1.toObject());
			article3.publicationDate = new Date();
			let changes = postChanged(article1, article3);
			expect(changes).to.equal(0);
		});
		it('ensure we dont ignore other fields', async () => {
			let article3 = Object.assign({}, article1.toObject());
			article3.link = '123';
			let changes = postChanged(article1, article3);
			expect(changes).to.equal(1);
		});
	});
});
