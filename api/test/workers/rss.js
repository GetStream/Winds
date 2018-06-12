import nock from 'nock';
import { expect } from 'chai';

import { rssQueue, OgQueueAdd } from '../../src/asyncTasks'
import RSS from '../../src/models/rss';
import Article from '../../src/models/article';
import { ParseFeed, ReadFeedURL } from '../../src/parsers/feed';
import { rssProcessor, handleRSS } from '../../src/workers/rss';
import { loadFixture, dropDBs, getTestFeed, getMockFeed } from '../utils';

describe('RSS worker', () => {
	let handler;

	function setupHandler() {
		handler = new Promise((resolve, reject) => {
			rssQueue.handlers['__default__'] = job => {
				return handleRSS(job).then(resolve, reject);
			};
		});
	}

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
	});

	after(() => {
		rssQueue.handlers['__default__'] = rssProcessor;
	});

	describe('queue', () => {
		it('should call worker when enqueueing jobs', async () => {
			setupHandler();

			const data = {
			    rss: '5b0ad0baf6f89574a638887a',
			    url: 'http://dorkly.com/comics/rss'
			};

			await rssQueue.add(data);
			await handler;
		});

		it('should fail for invalid job', async () => {
			const testCases = [
				{ rss: '5b0ad0baf6f89574a638887a', url: undefined },
				{ rss: '5b0ad0baf6f89574a638887a', url: '' },
				{ rss: '5b0ad0baf6f89574a638887a', url: 'http://mbmbam.libsyn.com/rssss' },
			];

			for (const data of testCases) {
				setupHandler();

				await rssQueue.add(data);
				let error = null;
				try {
					await handler;
				} catch (err) {
					error = err;
				}
				expect(error).to.be.an.instanceOf(Error);
			}
		});
	});

	describe('worker', () => {
		const data = {
			rss: '5b0ad0baf6f89574a638887a',
			url: 'http://dorkly.com/comics/rss'
		};
		let initialArticles;

		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');

			initialArticles = await Article.find({ rss: data.rss });

			nock(data.url).get('').reply(200, () => {
				return getTestFeed('hackernews');
			});

			getMockFeed('rss', data.rss).addActivities.resetHistory();
			ParseFeed.resetHistory();
			OgQueueAdd.resetHistory();
			setupHandler();

			await rssQueue.add(data);
			await handler;
		});

		after(() => {
			nock.cleanAll();
		});

		it('should parse the feed', async () => {
			expect(ParseFeed.calledOnceWith(data.url)).to.be.true;
		});

		it('should upsert article data from feed', async () => {
			const articles = await Article.find({ rss: data.rss });
			expect(articles).to.have.length(initialArticles.length + 30);
		});

		it('should update feed data', async () => {
			const rss = await RSS.findById(data.rss);
			expect(rss.postCount).to.be.equal(initialArticles.length + 30);
		});

		it('should add article data to Stream feed', async () => {
			const feed = getMockFeed('rss', data.rss);
			expect(feed).to.not.be.null;
			expect(feed.addActivities.called).to.be.true;

			const articles = await Article.find({
				_id: { $nin: initialArticles.map(a => a._id) },
				rss: data.rss,
			});
			const args = feed.addActivities.getCall(0).args[0].map(a => a.foreign_id);
			expect(args).to.have.length(articles.length);
			for (const article of articles) {
				expect(args).to.include(`articles:${article._id}`);
			}
		});

		it('should schedule OG job', async () => {
			const articles = await Article.find({
				_id: { $nin: initialArticles.map(a => a._id) },
				rss: data.rss,
			});
			expect(OgQueueAdd.getCalls()).to.have.length(30);

			const opts = { removeOnComplete: true, removeOnFail: true };
			for (const article of articles) {
				const args = { type: 'article', url: article.url };
				expect(OgQueueAdd.calledWith(args, opts), `Adding ${args.url} to OG queue`).to.be.true;
			}
		});
	});
});
