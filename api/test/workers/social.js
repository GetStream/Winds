import mongoose from 'mongoose';
import { expect } from 'chai';

import RSS from '../../src/models/rss';
import Article from '../../src/models/article';
import { fetchSocialScore } from '../../src/utils/social';
import { socialQueue } from '../../src/asyncTasks';
import { socialProcessor, handleSocial } from '../../src/workers/social';
import { loadFixture, dropDBs } from '../utils';

describe('Social worker', () => {
	let handler;

	function setupHandler() {
		handler = new Promise((resolve, reject) => {
			socialQueue.handlers['__default__'] = job => {
				return handleSocial(job).then(resolve, reject);
			};
		});
	}

	before(async () => {
		socialQueue.process(socialProcessor).catch(err => console.log(`OG PROCESSING FAILURE: ${err.stack}`));

		await dropDBs();
		await loadFixture('initial-data');
	});

	after(async () => {
		socialQueue.handlers['__default__'] = socialProcessor;
		await socialQueue.close();
	});

	describe('queue', () => {
		it('should call worker when enqueueing job', async () => {
			const articles = [{
				id: '5b0ad37226dc3db38194e5ec',
				link: 'http://mbmbam.libsyn.com/mbmbam-398-rest-in-reeses-pieces'
			}, {
				id: '5b0ad37226dc3db38194e5ec',
				commentUrl: 'https://techcrunch.com/2018/05/31/area-120-subway-pigeon/#respond'
			}];

			setupHandler();
			await socialQueue.add({ rss: '5b0ad0baf6f89574a638887a', articles });
			await handler;
		})

		it('should fail for invalid job', async () => {
			const articles = [{
				id: '5b0ad37226dc3db38194e5ec',
				link: 'http://mbmbam.libsyn.com/mbmbam-398-rest-in-reeses-pieces'
			}, {
				id: '5b0ad37226dc3db38194e5ec',
				commentUrl: 'https://techcrunch.com/2018/05/31/area-120-subway-pigeon/#respond'
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
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{ id: '', link: '' }] },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{ id: '5b0ad0baf6fb9574a638887a', link: '' }] },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{ id: '5b0ad0baf6fb9574a638887a', link: 'ftp://gogel.com' }] },
				{ rss: '5b0ad0baf6fb9574a638887a', articles: [{}] },
				{ rss: 0, articles },
				{ rss: null, articles },
				{ rss: undefined, articles },
			];

			fetchSocialScore.resetHistory();
			for (let i = 0; i < testCases.length; ++i) {
				setupHandler();

				const data = testCases[i];

				await socialQueue.add(data);
				await handler;

				expect(fetchSocialScore.called, `test case #${i + 1}`).to.be.false;
			}
		}).timeout(60000); //XXX: node 8 and 9 seem to take their sweet time to finish
	});

	describe('worker', () => {
		const data = {
			rss: '5b0ad0baf6f89574a638887a',
			articles: [{
				id: '5b0ad37226dc3db38194e5ec',
				link: 'https://choosealicense.com/'
			}, {
				id: '5b0ad37226dc3db38194e5ed',
				commentUrl: 'https://news.ycombinator.com/item?id=17243341'
			}],
		};

		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');

			setupHandler();
			await socialQueue.add(data);
			await handler;
		});

		it('should fetch article social score', async () => {
			const articles = await Article.find({
				_id: { $in: data.articles.map(a => a.id) },
				rss: data.rss,
			});
			for (const article of articles) {
				expect(article.socialScore).to.not.be.null;
				expect(article.socialScore.reddit).to.be.above(0);
				expect(article.socialScore.hackernews).to.be.above(0);
			}
		});
	});
});
