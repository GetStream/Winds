import { expect } from 'chai';

import RSS from '../../src/models/rss';
import Pin from '../../src/models/pin';
import Follow from '../../src/models/follow';
import Article from '../../src/models/article';
import { mergeFeeds } from '../../src/utils/merge';
import { loadFixture, dropDBs } from '../utils';

const feedA = '5b0ad0baf6f89574f638880a';
const feedB = '5b0ad0baf6f89574f638880b';

describe('Merge utility', () => {
	beforeEach(async () => {
		await dropDBs();
		await loadFixture('merge-data');
	});

	it('should mark one of the input feeds as duplicate', async () => {
		expect(await RSS.findById(feedA)).to.not.be.null;
		expect(await RSS.findById(feedB)).to.not.be.null;

		await mergeFeeds(feedA, feedB, 'rss');

		expect(await RSS.findById(feedA)).to.not.be.null;
		const feed = await RSS.findById(feedB);
		expect(String(feed.duplicateOf)).to.be.equal(feedA);
	});

	it('should move articles from one feed to another', async () => {
		await mergeFeeds(feedA, feedB, 'rss');

		expect(await Article.count({ rss: feedA })).to.be.equal(3);
		expect(await Article.count({ rss: feedB })).to.be.equal(2);
	});

	it('shouldn\'t produce duplicate articles', async () => {
		await mergeFeeds(feedA, feedB, 'rss');

		expect(await Article.count()).to.be.equal(5);
		const article1 = await Article.findById('5b0ad37226dc3db38194e5ee');
		expect(String(article1.duplicateOf)).to.be.equal('5b0ad37226dc3db38194e5ec');
		const article2 = await Article.findById('5b0ad37226dc3db38194e5ef');
		expect(String(article2.duplicateOf)).to.be.equal('5b0ad37226dc3db38194e5ed');
	});

	it('should move pins from one feed to another', async () => {
		await mergeFeeds(feedA, feedB, 'rss');

		const aArticles = await Article.find({ rss: feedA });
		const bArticles = await Article.find({ rss: feedB });
		expect(await Pin.count({ article: { $in: aArticles.map(a => a._id) } })).to.be.equal(4);
		expect(await Pin.count({ article: { $in: bArticles.map(a => a._id) } })).to.be.equal(0);
	});

	it('shouldn\'t produce duplicate pins', async () => {
		await mergeFeeds(feedA, feedB, 'rss');

		expect(await Pin.count()).to.be.equal(4);
		expect(await Pin.findById('5b0ad37226dc3db38194e603')).to.be.null;
	});

	it('should move followers from one feed to another', async () => {
		await mergeFeeds(feedA, feedB, 'rss');

		expect(await Follow.count({ rss: feedA })).to.be.equal(3);
		expect(await Follow.count({ rss: feedB })).to.be.equal(0);
	});

	it('shouldn\'t produce duplicate follows', async () => {
		await mergeFeeds(feedA, feedB, 'rss');

		expect(await Follow.count()).to.be.equal(3);
		expect(await Follow.findById('5b0ad37226dc3db38194e702')).to.be.null;
		expect(await Follow.findById('5b0ad37226dc3db38194e704')).to.be.null;
	});
});
