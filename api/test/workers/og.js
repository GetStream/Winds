import { expect } from 'chai';

import { ogQueue } from '../../src/asyncTasks';
import RSS from '../../src/models/rss';
import Episode from '../../src/models/episode';
import Article from '../../src/models/article';
import { ParseOG } from '../../src/parsers/og';
import { ogProcessor, handleOg } from '../../src/workers/og';
import { loadFixture, dropDBs } from '../utils';

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
		await dropDBs();
		await loadFixture('initial-data');
	});

	after(() => {
		ogQueue.handlers['__default__'] = ogProcessor;
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
				url:
					'http://dorkly.com/post/86418/4-questions-i-still-have-about-avengers-infinity-war',
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
			const image = await ParseOG.firstCall.returnValue;
			expect(image).to.not.be.null;
			const afterUpdate = await Article.findById(beforeUpdate._id);
			expect(afterUpdate.images.og).to.be.equal(image);
		});

		it('should update article with image if update requested', async () => {
			setupHandler();

			const data = {
				type: 'article',
				url:
					'http://dorkly.com/post/86517/what-if-deadpool-was-in-avengers-infinity-war2/',
				update: true,
			};

			const beforeUpdate = await Article.findOne({ url: data.url });
			expect(beforeUpdate.images.og).to.not.be.null;

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.calledWith(data.url)).to.be.true;
			const image = await ParseOG.firstCall.returnValue;
			expect(image).to.not.be.null;
			const afterUpdate = await Article.findById(beforeUpdate._id);
			expect(afterUpdate.images.og).to.be.equal(image);
		});

		it("shouldn't update article with image if update not requested", async () => {
			setupHandler();

			const data = {
				type: 'article',
				url:
					'http://dorkly.com/post/86517/what-if-deadpool-was-in-avengers-infinity-war2/',
			};

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.called).to.be.false;
		});

		it("shouldn't update article if no image is found", async () => {
			setupHandler();

			const data = {
				type: 'article',
				url: 'http://feedproxy.google.com/~r/bildblog/~3/sUeojXz2BCk',
			};

			await ogQueue.add(data);
			await handler;

			expect(ParseOG.calledWith(data.url)).to.be.true;
			const image = await ParseOG.firstCall.returnValue;
			expect(image).to.be.null;
		});
	});

	describe('invalid job', () => {
		it('should not update data', async () => {
			const testCases = [
				{ type: '', url: '' },
				{ type: '', url: '', update: true },
				{ type: undefined, url: undefined },
				{ type: undefined, url: undefined, update: true },
				{ type: 'episode', url: '' },
				{ type: 'article', url: '' },
				{ type: 'episode', url: '', update: true },
				{ type: 'article', url: '', update: true },
				{ type: 'episode', url: undefined },
				{ type: 'article', url: undefined },
				{ type: 'episode', url: undefined, update: true },
				{ type: 'article', url: undefined, update: true },
				{ type: 'cucumber', url: 'http://mbmbam.libsyn.com/rssss' },
				{ type: 'cucumber', url: 'http://mbmbam.libsyn.com/rssss', update: true },
			];

			ParseOG.resetHistory();

			for (const data of testCases) {
				setupHandler();

				await ogQueue.add(data);
				let error = null;
				try {
					await handler;
				} catch (err) {
					error = err;
				}

				expect(ParseOG.called).to.be.false;
				expect(error).to.be.an.instanceOf(Error);
			}
		});
	});
});
