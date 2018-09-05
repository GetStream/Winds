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
		await streamQueue.empty();

		streamQueue.process(streamProcessor).catch(err => console.log(`STREAM PROCESSING FAILURE: ${err.stack}`));

		await dropDBs();
		await loadFixture('initial-data');
	});

	after(async () => {
		streamQueue.handlers['__default__'] = streamProcessor;
		await streamQueue.close();
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
			const testCases = [
				{ podcast: '' },
				{ podcast: '5b0ad0baf6f89574a638887' },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: '' },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: 42 },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: [''] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: ['5b0ad0baf6f89574a638887'] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: ['5b0ad0baf6f89574a638887aa'] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: [42] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: [] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: [null] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: [undefined] },
				{ podcast: '5b0ad0baf6f89574a638887a', contentIds: null },
				{ podcast: '5b0ad0baf6f89574a638887aa' },
				{ podcast: 42 },
				{ podcast: null },
				{ podcast: undefined },
				{ rss: '' },
				{ rss: '5b0ad0baf6f89574a638887' },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: '' },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: 42 },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: [''] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: ['5b0ad0baf6f89574a638887'] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: ['5b0ad0baf6f89574a638887aa'] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: [42] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: [] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: [null] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: [undefined] },
				{ rss: '5b0ad0baf6f89574a638887a', contentIds: null },
				{ rss: '5b0ad0baf6f89574a638887aa' },
				{ rss: 42 },
				{ rss: null },
				{ rss: undefined },
			];

			sendFeedToCollections.resetHistory();
			for (let i = 0; i < testCases.length; ++i) {
				setupHandler();

				const data = testCases[i];

				await streamQueue.add(data);
				await handler;

				const rssFeed = getMockFeed('rss', data.rss);
				expect(sendFeedToCollections.called, `test case #${i + 1}`).to.be.false;
			}
		}).timeout(60000); //XXX: node 8 and 9 seem to take their sweet time to finish
	});

	describe('worker', () => {
		const data = {
			rss: '5b0ad0baf6f89574a638887a',
			contentIds: ['5b0ad37226dc3db38194e5ec', '5b0ad37226dc3db38194e5ed']
		};

		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');

			createMockFeed('rss', data.rss);
			setupHandler();

			sendFeedToCollections.resetHistory();
			await streamQueue.add(data);
			await handler;
		});

		it('should add article data to Stream feed', async () => {
			expect(sendFeedToCollections.calledOnce).to.be.true;
		});
	});
});
