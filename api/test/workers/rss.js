import { parse } from 'url';
import nock from 'nock';
import { expect } from 'chai';

import { rssQueue, OgQueueAdd, StreamQueueAdd, SocialQueueAdd } from '../../src/asyncTasks';
import RSS from '../../src/models/rss';
import Article from '../../src/models/article';
import { ParseFeed } from '../../src/parsers/feed';
import { rssProcessor, handleRSS, upsertManyArticles } from '../../src/workers/rss';
import { loadFixture, dropDBs, getTestFeed, createMockFeed, getMockFeed } from '../utils';

describe('RSS worker', () => {
	let originalOgQueueAdd;
	let originalStreamQueueAdd;
	let originalSocialQueueAdd;
	let handler;

	function setupHandler() {
		handler = new Promise((resolve, reject) => {
			rssQueue.handlers['__default__'] = job => {
				return handleRSS(job).then(resolve, reject);
			};
		});
	}

	before(async () => {
		await rssQueue.empty();
		OgQueueAdd.resetHistory();
		StreamQueueAdd.resetHistory();
		SocialQueueAdd.resetHistory();

		originalOgQueueAdd = OgQueueAdd._fn;
		originalStreamQueueAdd = StreamQueueAdd._fn;
		originalSocialQueueAdd = SocialQueueAdd._fn;
		OgQueueAdd._fn = () => Promise.resolve();
		StreamQueueAdd._fn = () => Promise.resolve();
		SocialQueueAdd._fn = () => Promise.resolve();

		rssQueue.process(rssProcessor).catch(err => console.error(`RSS PROCESSING FAILURE: ${err.stack}`));

		await dropDBs();
		await loadFixture('initial-data');
	});

	after(async () => {
		rssQueue.handlers['__default__'] = rssProcessor;
		await rssQueue.close();
		OgQueueAdd._fn = originalOgQueueAdd;
		StreamQueueAdd._fn = originalStreamQueueAdd;
		SocialQueueAdd._fn = originalSocialQueueAdd;
	});

	describe('queue', () => {
		const testCases = [];[
			'http://20minutes.fr/rss/france.xml',
			'http://20minutes.fr/rss/hightech.xml',
			'http://20minutes.fr/rss/paris.xml',
			'http://20minutes.fr/rss/une.xml',
			'http://adelcho88.podomatic.com/rss2.xml',
			'http://apublica.org/feed',
			'http://audiworld.com/rss.xml',
			'http://blog.moneydj.com/news/feed',
			'http://bookshadow.com/weblog/feeds',
			'http://dingxiaoyun555.blog.163.com/rss',
			'http://douban.com/feed/people/52041165/interests',
			'http://geektopia.es/rss.xml',
			'http://gossip.podomatic.com/rss2.xml',
			'http://htxt.co.za/feed',
			'http://jasonhaley.com/syndication.axd',
			'http://kaiak.tw/?cat=205&feed=rss2',
			'http://maxwell-land-surveying.com/feed',
			'http://opplopolis.com/feed/all',
			'http://rss.cnki.net/kns/rss.aspx?journal=hhzx&virtual=knavi',
			'http://scottishpoetrylibrary.podomatic.com/rss2.xml',
			'http://shanzhuoboshi.com/feed',
			'http://simonsays.fr/feed',
			'http://sospc.name/feed',
			'http://sourcedigit.com/feed',
			'http://stevestoj.podomatic.com/rss2.xml',
			'http://straitstimes.com/news/asia/rss.xml',
			'http://sunnymegatron.com/feed',
			'http://tejiendoelmundo.wordpress.com/feed',
			'http://thejunkies.podomatic.com/rss2.xml',
			'http://thewildeternal.com/blog/feed',
			'http://totoyao.wordpress.com/feed',
			'http://xda-developers.com/category/android/feed',
			'http://yan.sg/feed',
			'http://zhukun.net/feed',
			'https://90.cx/feed',
			'https://api.prprpr.me/weibo/rss/5953553734',
			'https://lowendbox.com/feed',
			'https://qiujunya.com/feed',
			'https://seattle.craigslist.org/search/act?format=rss',
			'https://torrentedigital.com/feed',
			'https://ttt.tt/feed',
		];

		for (let i = 0; i < testCases.length; ++i) {

			it(`should call worker when enqueueing job for ${testCases[i]}`, async () => {
				async function queue(url) {
					setupHandler();
					await rssQueue.add({ rss: '5b0ad0baf6f89574a638887a', url });
					await handler;
				}

				//XXX: fetching data from the net failed, falling back to mocking
				const url = parse(testCases[i]);
				nock(url.host)
					.get(url.path)
					.query(url.query)
					.reply(200, () => getTestFeed(url.host));
				await queue(testCases[i]);
				nock.cleanAll();
			}).timeout(30000).retries(2);
		}

		it('should fail for invalid job', async () => {
			const rssID = '5b0ad0baf6f89574a638887a';
			const testCases = [
				{ rss: rssID, url: undefined },
				{ rss: rssID, url: '' },
				{ rss: rssID, url: 'http://mbmbam.libsyn.com/rssss' },
			];

			const before = await RSS.findById(rssID);
			for (let i = 0; i < testCases.length; ++i) {
				setupHandler();

				const data = testCases[i];

				await rssQueue.add(data);
				await handler;

				const after = await RSS.findById(data.rss);
				expect(after.consecutiveScrapeFailures, `test case #${i + 1}`).to.be.an.equal(before.consecutiveScrapeFailures + i + 1);
			}
		});
	});

	describe('worker', () => {
		const data = {
			rss: '5b0ad0baf6f89574a638887a',
			url: 'http://dorkly.com/comics/rss',
		};
		let initialArticles;

		describe('invalid feed', () => {
			beforeEach(async () => {
				await dropDBs();
				await loadFixture('initial-data');

				initialArticles = await Article.find({ rss: data.rss });

				createMockFeed('rss', data.rss);
				ParseFeed.resetHistory();
				OgQueueAdd.resetHistory();
				SocialQueueAdd.resetHistory();
				StreamQueueAdd.resetHistory();
				setupHandler();
			});

			afterEach(() => {
				nock.cleanAll();
			});

			it('should fail to parse malformed feed', async () => {
				nock(data.url)
					.get('')
					.twice()
					.reply(200, () => {
						return getTestFeed('malformed-hackernews');
					});

				await rssQueue.add(data);
				await handler;

				const articles = await Article.find({ rss: data.rss });
				expect(articles).to.have.length.above(initialArticles.length);
			});

			it('should fail to parse empty feed', async () => {
				nock(data.url)
					.get('')
					.twice()
					.reply(200, () => {
						return getTestFeed('empty');
					});

				await rssQueue.add(data);
				await handler;

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

				createMockFeed('rss', data.rss);
				ParseFeed.resetHistory();
				OgQueueAdd.resetHistory();
				SocialQueueAdd.resetHistory();
				StreamQueueAdd.resetHistory();
				setupHandler();

				nock(data.url)
					.get('')
					.twice()
					.reply(200, () => {
						return getTestFeed('hackernews');
					});

				await rssQueue.add(data);
				await handler;
			});

			after(() => {
				nock.cleanAll();
			});

			it('should parse the feed', async () => {
				expect(ParseFeed.calledWith(data.url)).to.be.true;
			});

			it('should upsert article data from feed', async () => {
				const articles = await Article.find({ rss: data.rss });
				expect(articles).to.have.length(initialArticles.length + newArticleCount);
			});

			it('should update feed data', async () => {
				const rss = await RSS.findById(data.rss);
				expect(rss.postCount).to.be.equal(initialArticles.length + newArticleCount);
				expect(rss.guidStability).to.be.equal('STABLE');
			});

			it('should schedule OG job', async () => {
				const articles = await Article.find({
					_id: { $nin: initialArticles.map(a => a._id) },
					rss: data.rss,
				});
				const opts = { removeOnComplete: true, removeOnFail: true };
				const args = { type: 'article', rss: data.rss, urls: articles.filter(a => !!a.url).map(a => a.url) };
				expect(OgQueueAdd.calledOnceWith(args, opts)).to.be.true;
			});

			it('should schedule Social job', async () => {
				const newArticles = await Article.find({
					_id: { $nin: initialArticles.map(a => a._id) },
					rss: data.rss,
				});
				const articles = newArticles.filter(a => !!a.url).map(a => ({
					id: a._id,
					link: a.link,
					commentUrl: a.commentUrl,
				}));
				const opts = { removeOnComplete: true, removeOnFail: true };
				const args = { rss: data.rss, articles };
				expect(SocialQueueAdd.calledOnceWith(args, opts)).to.be.true;
			});

			it('should schedule Stream job', async () => {
				const opts = { removeOnComplete: true, removeOnFail: true };
				const newArticles = await Article.find({
					_id: { $nin: initialArticles.map(a => a._id) },
					rss: data.rss,
				});
				const articleIDs = newArticles.filter(a => !!a.url).map(a => a._id);
				const args = { rss: data.rss, contentIds: articleIDs };
				expect(StreamQueueAdd.calledOnceWith(args, opts)).to.be.true;
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
		});

		describe('feed w/ unstable guid values', () => {
			const testData = [{
				rss: '5b0bfaf6bf3863483f0b71e7',
				url: 'http://todopvr.com/foro/news_rss.php',
			}, {
				rss: '5b0a1c041bbf863ebe703dbe',
				url: 'http://search.worldbank.org/api/v2/news?countrycode_exact=pe&format=atom',
			}, {
				rss: '5b04c778e8865b482745bdee',
				url: 'http://social.msdn.microsoft.com/search/feed/?format=rss&query=blogs&refinement=109',
			}];

			before(async () => {
				await dropDBs();
				await loadFixture('unstable-guid');
			});

			it.skip('should update feed data', async () => {
				for (const data of testData) {
					setupHandler();

					await rssQueue.add(data);
					await handler;

					const rss = await RSS.findById(data.rss);
					expect(rss.guidStability).to.be.equal('UNSTABLE');
				}
			});
		});
	});
});
