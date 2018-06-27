import { expect } from 'chai';
import url from 'url';
import Article from '../../src/models/article';
import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import { loadFixture, dropDBs } from '../utils';

describe('URLs utility', () => {
	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
	});

	it('should return a valid article url', async () => {
		const article = await Article.findOne();
		const parsedUrl = url.parse(article.getUrl());
		expect(parsedUrl.href).to.be.a('string');
		expect(parsedUrl.protocol).to.be.a('string');
	});

	it('should return a valid rss url', async () => {
		const rss = await RSS.findOne();
		const parsedUrl = url.parse(rss.getUrl());
		expect(parsedUrl.href).to.be.a('string');
		expect(parsedUrl.protocol).to.be.a('string');
	});

	it('should return a valid podcast url', async () => {
		const podcast = await Podcast.findOne();
		const parsedUrl = url.parse(podcast.getUrl());
		expect(parsedUrl.href).to.be.a('string');
		expect(parsedUrl.protocol).to.be.a('string');
	});
});
