import { expect } from 'chai';

import { streamQueue } from '../../src/asyncTasks';
import RSS from '../../src/models/rss';
import Article from '../../src/models/article';
import { sendFeedToCollections } from '../../src/utils/collections';
import { streamProcessor, handleStream } from '../../src/workers/stream';
import { loadFixture, dropDBs, createMockFeed, getMockFeed } from '../utils';

describe('Stream worker', () => {
	let handler;

	function setupHandler() {
		handler = new Promise((resolve, reject) => {
			streamQueue.handlers['__default__'] = job => {
				return handleStream(job).then(resolve, reject);
			};
		});
	}

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
	});

	after(() => {
		streamQueue.handlers['__default__'] = streamProcessor;
	});

	describe('queue', () => {
		it('should call worker when enqueueing job', async () => {
			const articles = [{
				id: '5b0ad37226dc3db38194e5ec',
				publicationDate: '2018-05-25T13:00:00.000Z'
			}];

			setupHandler();
			await streamQueue.add({ rss: '5b0ad0baf6f89574a638887a', articles });
			await handler;
		})

		it('should fail for invalid job', async () => {
			const articles = [{
				id: '5b0ad37226dc3db38194e5ec',
				publicationDate: '2018-05-25T13:00:00.000Z'
			}, {
				id: '5b0ad37226dc3db38194e69b',
				publicationDate: '2018-05-25T06:54:35.000Z'
			}];
			const testCases = [
				{ rss: '5b0ad0baf6f-9574a638887a', articles },
				{ rss: '5b0ad0baf6f89574a638887', articles },
				{ rss: '5b0ad0baf6f89574a638887a', articles: '' },
				{ rss: '5b0ad0baf6f89574a638887a', articles: 0 },
				{ rss: '5b0ad0baf6f89574a638887a', articles: [] },
				{ rss: '5b0ad0baf6f89574a638887a', articles: null },
				{ rss: '5b0ad0baf6f89574a638887a', articles: undefined },
				{ rss: '5b0ad0baf6f89574a638887a', articles: {} },
				{ rss: '5b0ad0baf6f89574a638887aa', articles },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{ id: '', publicationDate: '' }] },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{ id: '5b0ad0baf6fb9574a638887a', publicationDate: '' }] },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{ id: '5b0ad0baf6fb9574a638887a', publicationDate: '2018/25/05 13:00:00' }] },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{}] },
				{ rss: 0, articles },
				{ rss: null, articles },
				{ rss: undefined, articles },
			];

			for (let i = 0; i < testCases.length; ++i) {
				setupHandler();

				const data = testCases[i];

				await streamQueue.add(data);
				await handler;

				const rssFeed = getMockFeed('rss', data.rss);
				expect(rssFeed.addActivities.called, `test case #${i + 1}`).to.be.false;
				expect(sendFeedToCollections.called, `test case #${i + 1}`).to.be.false;
			}
		});
	});

	describe('worker', () => {
		const data = {
			rss: '5b0ad0baf6f89574a638887a',
			articles: [{
				id: '5b0ad37226dc3db38194e5ec',
				publicationDate: '2018-05-25T13:00:00.000Z'
			}, {
				id: '5b0ad37226dc3db38194e69b',
				publicationDate: '2018-05-25T06:54:35.000Z'
			}],
		};

		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');

			createMockFeed('rss', data.rss);
			setupHandler();

			await streamQueue.add(data);
			await handler;
		});

		it('should add article data to Stream feed', async () => {
			const feed = getMockFeed('rss', data.rss);
			expect(feed).to.not.be.null;
			expect(feed.addActivities.called).to.be.true;

			const articles = await Article.find({
				_id: { $in: data.articles.map(a => a._id) },
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
	});
});
