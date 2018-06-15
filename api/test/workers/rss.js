import nock from 'nock';
import { expect } from 'chai';

import { rssQueue, OgQueueAdd } from '../../src/asyncTasks'
import RSS from '../../src/models/rss';
import Article from '../../src/models/article';
import { ParseFeed } from '../../src/parsers/feed';
import { rssProcessor, handleRSS, upsertManyArticles } from '../../src/workers/rss';
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
				url: 'https://seattle.craigslist.org/search/act?format=rss'
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

			for (let i = 0; i < testCases.length; ++i) {
				setupHandler();

				const data = testCases[i];
				await rssQueue.add(data);
				let error = null;
				try {
					await handler;
				} catch (err) {
					error = err;
				}
				expect(error).to.be.an.instanceOf(Error);
				const rss = await RSS.findById(data.rss);
				expect(rss.consecutiveScrapeFailures).to.be.an.equal(i + 1);
			}
		});
	});

	describe('worker', () => {
		const data = {
			rss: '5b0ad0baf6f89574a638887a',
			url: 'http://dorkly.com/comics/rss'
		};
		let initialArticles;

		describe('invalid feed', () => {
			beforeEach(async () => {
				await dropDBs();
				await loadFixture('initial-data');

				initialArticles = await Article.find({ rss: data.rss });

				getMockFeed('rss', data.rss).addActivities.resetHistory();
				ParseFeed.resetHistory();
				OgQueueAdd.resetHistory();
				setupHandler();
			});

			it('should parse malformed feed', async () => {
				nock(data.url).get('').reply(200, () => {
					return getTestFeed('malformed-hackernews');
				});

				await rssQueue.add(data);
				await handler;

				const articles = await Article.find({ rss: data.rss });
				expect(articles).to.have.length.above(initialArticles.length);
			});

			it('should fail to parse empty feed', async () => {
				nock(data.url).get('').reply(200, () => {
					return getTestFeed('empty');
				});

				await rssQueue.add(data);
				let error = null;
				try {
					await handler;
				} catch (err) {
					error = err;
				}
				expect(error).to.be.an.instanceOf(Error);

				const articles = await Article.find({ rss: data.rss });
				expect(articles).to.have.length(initialArticles.length);
			});
		});

		describe('valid feed', () => {
			const newArticleCount = 30;

			before(async () => {
				await dropDBs();
				await loadFixture('initial-data');

				initialArticles = await Article.find({ rss: data.rss });

				getMockFeed('rss', data.rss).addActivities.resetHistory();
				ParseFeed.resetHistory();
				OgQueueAdd.resetHistory();
				setupHandler();

				nock(data.url).get('').reply(200, () => {
					return getTestFeed('hackernews');
				});

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
				expect(articles).to.have.length(initialArticles.length + newArticleCount);
			});

			it('should update feed data', async () => {
				const rss = await RSS.findById(data.rss);
				expect(rss.postCount).to.be.equal(initialArticles.length + newArticleCount);
			});

			it('should add article data to Stream feed', async () => {
				const feed = getMockFeed('rss', data.rss);
				expect(feed).to.not.be.null;
				expect(feed.addActivities.called).to.be.true;

				const articles = await Article.find({
					_id: { $nin: initialArticles.map(a => a._id) },
					rss: data.rss,
				});
				const batchCount = Math.ceil(articles.length / 100);
				const foreignIds = articles.map(a => `articles:${a._id}`);
				let matchedActivities = 0;
				for (let i = 0; i < batchCount; ++i) {
					const batchSize = Math.min(100, articles.length - i * 100);
					const args = feed.addActivities.getCall(i).args[0].map(a => a.foreign_id);
					expect(args).to.have.length(batchSize);
					matchedActivities += args.filter(arg => foreignIds.includes(arg)).length;
				}
				expect(matchedActivities).to.equal(articles.length);
			});

			it('should schedule OG job', async () => {
				const articles = await Article.find({
					_id: { $nin: initialArticles.map(a => a._id) },
					rss: data.rss,
				});
				expect(OgQueueAdd.getCalls()).to.have.length(newArticleCount);

				const opts = { removeOnComplete: true, removeOnFail: true };
				for (const article of articles) {
					const args = { type: 'article', url: article.url };
					expect(OgQueueAdd.calledWith(args, opts), `Adding ${args.url} to OG queue`).to.be.true;
				}
			});
		});
	});
});

describe('upsertManyArticles', () => {
	const rssID = '5b0ad0baf6f89574a638887f';
	let articles;

	before(async () => {
		await dropDBs();
		await RSS.create({
			_id: rssID,
			title: 'RSS',
			feedUrl: 'http://amazon.com'
		});

		articles = Array.from(Array(5).keys()).map(i => {
			return {
				rss: rssID,
				title: `Article #${i}`,
				description: 'Article about life the universe and everything',
				url: `http://google.com/${i}`,
				contentHash: `a${i}`
			};
		});
	});

	it('should insert articles', async () => {
		await upsertManyArticles(rssID, articles);

		const insertedArticles = await Article.find({ rss: rssID }).sort('contentHash');
		expect(insertedArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(insertedArticles[i].url).to.be.equal(articles[i].url);
			expect(insertedArticles[i].title).to.be.equal(articles[i].title);
			expect(insertedArticles[i].description).to.be.equal(articles[i].description);
			expect(insertedArticles[i].contentHash).to.be.equal(articles[i].contentHash);
		}
	});

	it('should update articles', async () => {
		for (let i in articles) {
			articles[i].title = `Article №${i}`;
			articles[i].description = 'Article about pugs';
			articles[i].contentHash = `b${i}`;
		}
		await upsertManyArticles(rssID, articles);

		const updatedArticles = await Article.find({ rss: rssID }).sort('contentHash');
		expect(updatedArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(updatedArticles[i].url).to.be.equal(articles[i].url);
			expect(updatedArticles[i].title).to.be.equal(articles[i].title);
			expect(updatedArticles[i].description).to.be.equal(articles[i].description);
			expect(updatedArticles[i].contentHash).to.be.equal(articles[i].contentHash);
		}
	});

	it('should only upsert articles w/ new content hash affecting fields', async () => {
		// no data changed
		let nonUpdateResult = await upsertManyArticles(rssID, articles);
		for (const article of nonUpdateResult) {
			expect(article).to.be.null;
		}
		let existingArticles = await Article.find({ rss: rssID });
		expect(existingArticles).to.have.length(articles.length);

		// url changed content stayed the same
		for (let i in articles) {
			articles[i].url = `http://google.com/${i}/`;
		}
		nonUpdateResult = await upsertManyArticles(rssID, articles);
		for (const article of nonUpdateResult) {
			expect(article).to.be.null;
		}
		existingArticles = await Article.find({ rss: rssID });
		expect(existingArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(existingArticles[i].url).to.not.be.equal(articles[i].url);
		}

		// content changed
		for (let i in articles) {
			articles[i].url = `http://google.com/${i}`; // reverting url change
			articles[i].content = `c${i}`;
			articles[i].contentHash = `c${i}`; // simulating content hash recalculation
		}
		const newHashResult = await upsertManyArticles(rssID, articles);
		for (const article of newHashResult) {
			expect(article).to.not.be.null;
		}
		existingArticles = await Article.find({ rss: rssID }).sort('contentHash');
		expect(existingArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(existingArticles[i].contentHash).to.be.equal(articles[i].contentHash);
		}
	});
});
