import nock from 'nock';
import { expect } from 'chai';

import { ogQueue } from '../../src/asyncTasks';
import RSS from '../../src/models/rss';
import Episode from '../../src/models/episode';
import Article from '../../src/models/article';
import { ParseOG } from '../../src/parsers/og';
import { ogProcessor, handleOg } from '../../src/workers/og';
import { getTestPage, loadFixture, dropDBs } from '../utils';

describe('OG worker', () => {
	let handler;

	function setupHandler() {
		handler = new Promise((resolve, reject) => {
			ogQueue.handlers['__default__'] = job => {
				return handleOg(job).then(resolve, reject);
			};
		});
	}

	before(async () => {
		ogQueue.process(ogProcessor).catch(err => console.log(`OG PROCESSING FAILURE: ${err.stack}`));

		await dropDBs();
		await loadFixture('initial-data');
	});

	after(async () => {
		ogQueue.handlers['__default__'] = ogProcessor;
		await ogQueue.close();
	});

	describe('valid job', () => {
		let rss;

		before(async () => {
			rss = await RSS.findOne();
		});

		beforeEach(() => {
			ParseOG.resetHistory();
		});

		it('should update article if image is found', async () => {
			setupHandler();

			const data = {
				type: 'article',
				rss: rss._id,
				url: 'http://dorkly.com/post/86418/4-questions-i-still-have-about-avengers-infinity-war',
			};
			const beforeUpdate = await Article.create({
				rss: rss._id,
				title: 'Hey now',
				description: 'Donkey!',
				url: data.url,
				fingerprint: 'test:workers-og.js',
			});

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.calledWith(data.url)).to.be.true;
			const og = await ParseOG.firstCall.returnValue;
			expect(og).to.have.property('image');
			const afterUpdate = await Article.findById(beforeUpdate._id);
			expect(afterUpdate.images.og).to.be.equal(og.image);
		});

		it('should update article with image if update requested', async () => {
			setupHandler();

			const data = {
				type: 'article',
				rss: rss._id,
				url: 'http://dorkly.com/post/86517/what-if-deadpool-was-in-avengers-infinity-war2/',
				update: true,
			};

			const beforeUpdate = await Article.findOne({ url: data.url });
			expect(beforeUpdate.images.og).to.not.be.null;

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.calledWith(data.url)).to.be.true;
			const og = await ParseOG.firstCall.returnValue;
			expect(og).to.have.property('image');
			const afterUpdate = await Article.findById(beforeUpdate._id);
			expect(afterUpdate.images.og).to.be.equal(og.image);
		});

		it("shouldn't update article with image if update not requested", async () => {
			setupHandler();

			const data = {
				type: 'article',
				rss: rss._id,
				url: 'http://dorkly.com/post/86517/what-if-deadpool-was-in-avengers-infinity-war2/',
			};

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.called).to.be.false;
		});

		it("shouldn't update article if no image is found", async () => {
			setupHandler();

			const data = {
				type: 'article',
				rss: rss._id,
				url: 'http://feedproxy.google.com/~r/bildblog/~3/sUeojXz2BCk',
			};

			nock('http://feedproxy.google.com/~r/bildblog/~3/sUeojXz2BCk')
				.defaultReplyHeaders({
					'Content-Type': 'text/html'
				})
				.get('')
				.reply(200, () => getTestPage('bildblog.html'));

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.calledWith(data.url)).to.be.true;
			const og = await ParseOG.firstCall.returnValue;
			expect(og).to.not.have.property('image');

			nock.cleanAll();
		});
	});

	describe('invalid job', () => {
		it('should not update data', async () => {
			const testCases = [
				{ podcast: '', type: '', url: '' },
				{ podcast: '', type: '', url: '', update: true },
				{ podcast: '', type: '', urls: [''] },
				{ podcast: '', type: '', urls: [''], update: true },
				{ podcast: '', type: 'article', url: '' },
				{ podcast: '', type: 'article', url: '', update: true },
				{ podcast: '', type: 'article', url: undefined },
				{ podcast: '', type: 'article', url: undefined, update: true },
				{ podcast: '', type: 'article', urls: [''] },
				{ podcast: '', type: 'article', urls: [''], update: true },
				{ podcast: '', type: 'article', urls: [undefined] },
				{ podcast: '', type: 'article', urls: [undefined], update: true },
				{ podcast: '', type: 'episode', url: '' },
				{ podcast: '', type: 'episode', url: '', update: true },
				{ podcast: '', type: 'episode', url: undefined },
				{ podcast: '', type: 'episode', url: undefined, update: true },
				{ podcast: '', type: 'episode', urls: [''] },
				{ podcast: '', type: 'episode', urls: [''], update: true },
				{ podcast: '', type: 'episode', urls: [undefined] },
				{ podcast: '', type: 'episode', urls: [undefined], update: true },
				{ podcast: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ podcast: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ podcast: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ podcast: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ podcast: '', type: undefined, url: undefined },
				{ podcast: '', type: undefined, url: undefined, update: true },
				{ podcast: '', type: undefined, urls: [undefined] },
				{ podcast: '', type: undefined, urls: [undefined], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: '', url: '' },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: '', url: '', update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: '', urls: [''] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: '', urls: [''], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', url: '' },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', url: '', update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', url: undefined },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', url: undefined, update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [''] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [''], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [undefined] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [undefined], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', url: '' },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', url: '', update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', url: undefined },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', url: undefined, update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [''] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [''], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [undefined] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [undefined], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: undefined, url: undefined },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: undefined, url: undefined, update: true },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: undefined, urls: [undefined] },
				{ podcast: '5b0ad37226dc3db38194e5ec', type: undefined, urls: [undefined], update: true },
				{ rss: '', type: '', url: '' },
				{ rss: '', type: '', url: '', update: true },
				{ rss: '', type: '', urls: [''] },
				{ rss: '', type: '', urls: [''], update: true },
				{ rss: '', type: 'article', url: '' },
				{ rss: '', type: 'article', url: '', update: true },
				{ rss: '', type: 'article', url: undefined },
				{ rss: '', type: 'article', url: undefined, update: true },
				{ rss: '', type: 'article', urls: [''] },
				{ rss: '', type: 'article', urls: [''], update: true },
				{ rss: '', type: 'article', urls: [undefined] },
				{ rss: '', type: 'article', urls: [undefined], update: true },
				{ rss: '', type: 'episode', url: '' },
				{ rss: '', type: 'episode', url: '', update: true },
				{ rss: '', type: 'episode', url: undefined },
				{ rss: '', type: 'episode', url: undefined, update: true },
				{ rss: '', type: 'episode', urls: [''] },
				{ rss: '', type: 'episode', urls: [''], update: true },
				{ rss: '', type: 'episode', urls: [undefined] },
				{ rss: '', type: 'episode', urls: [undefined], update: true },
				{ rss: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ rss: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ rss: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ rss: '', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ rss: '', type: undefined, url: undefined },
				{ rss: '', type: undefined, url: undefined, update: true },
				{ rss: '', type: undefined, urls: [undefined] },
				{ rss: '', type: undefined, urls: [undefined], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: '', url: '' },
				{ rss: '5b0ad37226dc3db38194e5ec', type: '', url: '', update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: '', urls: [''] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: '', urls: [''], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', url: '' },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', url: '', update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', url: undefined },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', url: undefined, update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [''] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [''], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [undefined] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'article', urls: [undefined], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', url: '' },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', url: '', update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', url: undefined },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', url: undefined, update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [''] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [''], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [undefined] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'episode', urls: [undefined], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: undefined, url: undefined },
				{ rss: '5b0ad37226dc3db38194e5ec', type: undefined, url: undefined, update: true },
				{ rss: '5b0ad37226dc3db38194e5ec', type: undefined, urls: [undefined] },
				{ rss: '5b0ad37226dc3db38194e5ec', type: undefined, urls: [undefined], update: true },
				{ type: '', url: '' },
				{ type: '', url: '', update: true },
				{ type: '', urls: [''] },
				{ type: '', urls: [''], update: true },
				{ type: 'article', url: '' },
				{ type: 'article', url: '', update: true },
				{ type: 'article', url: undefined },
				{ type: 'article', url: undefined, update: true },
				{ type: 'article', urls: [''] },
				{ type: 'article', urls: [''], update: true },
				{ type: 'article', urls: [undefined] },
				{ type: 'article', urls: [undefined], update: true },
				{ type: 'episode', url: '' },
				{ type: 'episode', url: '', update: true },
				{ type: 'episode', url: undefined },
				{ type: 'episode', url: undefined, update: true },
				{ type: 'episode', urls: [''] },
				{ type: 'episode', urls: [''], update: true },
				{ type: 'episode', urls: [undefined] },
				{ type: 'episode', urls: [undefined], update: true },
				{ type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'] },
				{ type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ type: 'xenomorph', urls: ['http://mbmbam.libsyn.com/rssss'], update: true },
				{ type: undefined, url: undefined },
				{ type: undefined, url: undefined, update: true },
				{ type: undefined, urls: [undefined] },
				{ type: undefined, urls: [undefined], update: true },
			];

			ParseOG.resetHistory();

			for (let i in testCases) {
				const data = testCases[i];
				setupHandler();

				await ogQueue.add(data);
				await handler;

				expect(ParseOG.called).to.be.false;
			}
		});
	});
});
