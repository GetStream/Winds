import mongoose from 'mongoose';
import { expect } from 'chai';

import RSS from '../../src/models/rss';
import Article from '../../src/models/article';
import Episode from '../../src/models/episode';

import { normalizedDiff, upsertManyPosts } from '../../src/utils/upsert';
import {
	ReadFeedStream,
	ParseFeedPosts,
	ParsePodcastPosts,
	CreateFingerPrints,
} from '../../src/parsers/feed';
import { loadFixture, dropDBs, getTestFeed, getTestPodcast } from '../utils';

const duplicateKeyError = 11000;

function objectifyAndStripId(post) {
	const { id, _id, ...rest } = post.toObject ? post.toObject() : post;
	return Object.assign({}, rest);
}

describe('Upsert', () => {
	let article1, article2, episode1;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		article1 = await Article.findOne({ _id: '5b0ad37226dc3db38194e5ec' }).lean();
		article2 = await Article.findOne({ _id: '5b0ad37226dc3db38194e5ed' }).lean();
		episode1 = await Episode.findOne().lean();
	});

	describe('Article upsertManyPosts', () => {
		it('the same article shouldnt trigger an update', async () => {
			let operationMap = await upsertManyPosts(article1.rss, [article2], 'rss');
			expect(operationMap.changed).to.be.empty;
			expect(operationMap.new).to.be.empty;
		});

		it("publicationDate change shouldn't result in an update", async () => {
			const article3 = new Article(
				Object.assign(objectifyAndStripId(article1), {
					publicationDate: new Date(),
				}),
			);
			CreateFingerPrints([article3], 'STABLE');

			const operationMap = await upsertManyPosts(article1.rss, [article3], 'rss');
			expect(operationMap.changed).to.be.empty;
			expect(operationMap.new).to.be.empty;
		});

		it('link change should result in an update', async () => {
			const article3 = new Article(
				Object.assign(objectifyAndStripId(article1), {
					link: 'https://google.com/test',
				}),
			);
			CreateFingerPrints([article3], 'STABLE');

			const operationMap = await upsertManyPosts(article1.rss, [article3], 'rss');
			expect(operationMap.changed).to.have.length(1);
			expect(operationMap.new).to.be.empty;
			expect(await Article.findOne({ _id: operationMap.changed[0]._id })).to.not.be
				.null;
		});

		it('a new article should be inserted', async () => {
			const article3 = new Article({
				fingerprint: 'hello world',
				url: 'https://google.com/testhelloworld',
				rss: article1.rss,
				title: 'hi',
			});

			let operationMap = await upsertManyPosts(article1.rss, [article3], 'rss');
			expect(operationMap.new).to.have.length(1);
			expect(await Article.findOne({ _id: operationMap.new[0]._id })).to.not.be
				.null;
		});
	});

	describe('Episode upsertManyPosts', () => {
		it('the same episode shouldnt trigger an update', async () => {
			let operationMap = await upsertManyPosts(
				episode1.podcast,
				[episode1],
				'podcast',
			);
			expect(operationMap.changed).to.be.empty;
			expect(operationMap.new).to.be.empty;
		});

		it('a new episode should be inserted', async () => {
			let episode3 = new Episode({
				fingerprint: 'hello world 2',
				url: 'hi',
				title: 'hi2',
				podcast: episode1.podcast,
			});

			let operationMap = await upsertManyPosts(
				episode1.podcast,
				[episode3],
				'podcast',
			);
			expect(operationMap.new).to.have.length(1);
		});
	});

	describe('Double Inserts RSS feed', () => {
		// loop over feeds, and verify that the 2nd insert has 0 changes
		// this will break if something is wrong with the upsert/change detection
		for (let [f, url] of Object.entries({
			'techcrunch': 'https://techcrunch.com/feed',
			'reddit-r-programming': 'https://reddit.com/r/programming.rss',
			'hackernews': 'https://news.ycombinator.com',
			'medium-technology': 'https://medium.com',
		})) {
			it(`the second run should be unchanged for ${f}`, async () => {
				let posts = await ReadFeedStream(getTestFeed(f));
				let feedResponse = ParseFeedPosts('', posts);
				let articles = feedResponse.articles;

				for (let a of articles) {
					a['rss'] = '5b0ad37226dc3db38194e5ef';
				}
				await upsertManyPosts('5b0ad37226dc3db38194e5ef', articles, 'rss');
				let operationMap = await upsertManyPosts(
					'5b0ad37226dc3db38194e5ef',
					articles,
					'rss',
				);
				expect(operationMap.new).to.be.empty;
				expect(operationMap.changed).to.be.empty;
			});
		}
	});

	describe('BulkWrite behaviour', () => {
		// article ids are generated upon object creation
		// they remain the same during insert
		// bulk write error handling

		it(`article instantiation`, async () => {
			const a = new Article({ fingerprint: 'hihi', url: 'https://google.com/' });
			expect(a.id).to.not.be.null;
		});

		it(`article create`, async () => {
			const a = new Article({
				fingerprint: 'hihi2',
				url: 'https://google.com/',
				rss: '5b0ad37226dc3db38194e5ef',
				title: 123,
			});
			const a2 = await Article.create(a.toObject());
			expect(a.id).to.equal(a2.id);
		});

		it(`bulkwrite errors`, async () => {
			const data = new Article({
				fingerprint: 'hihi3',
				url: 'https://google.com/',
				rss: '5b0ad37226dc3db38194e5ef',
				title: 123,
			}).toObject();
			const operations = [
				{ insertOne: { document: data } },
				{ insertOne: { document: data } },
			];

			let error;
			try {
				await Article.bulkWrite(operations, { ordered: false });
			} catch (e) {
				error = e;
			}
			expect(error)
				.to.be.an.instanceOf(Error)
				.with.property('code', duplicateKeyError);
		});
	});

	describe('Double Inserts Podcasts', () => {
		// loop over feeds, and verify that the 2nd insert has 0 changes
		// this will break if something is wrong with the upsert/change detection
		for (let f of ['giant-bombcast', 'serial', 'a16z']) {
			it(`the second run should be unchanged for ${f}`, async () => {
				const posts = await ReadFeedStream(getTestPodcast(f));
				const feedResponse = ParsePodcastPosts('', posts);
				const episodes = feedResponse.episodes;

				for (const e of episodes) {
					e['podcast'] = '5b0ad37226dc3db38194e5ef';
				}
				await upsertManyPosts('5b0ad37226dc3db38194e5ef', episodes, 'podcast');
				const operationMap = await upsertManyPosts(
					'5b0ad37226dc3db38194e5ef',
					episodes,
					'podcast',
				);
				expect(operationMap.new).to.be.empty;
				expect(operationMap.changed).to.be.empty;
			});
		}
	});

	describe('normalizedDiff diff function', () => {
		it('the diff between these 2 articles should be 4', async () => {
			const changes = normalizedDiff(article1, article2);
			expect(changes).to.have.length(4);
		});
		it('the diff between these 2 articles should be 0', async () => {
			const changes = normalizedDiff(article1, article1);
			expect(changes).to.be.empty;
		});
		it('test if we ignore publication date', async () => {
			const article3 = Object.assign(objectifyAndStripId(article1), {
				publicationDate: new Date(),
			});

			const changes = normalizedDiff(article1, article3);
			expect(changes).to.be.empty;
		});
		it('ensure we dont ignore other fields', async () => {
			const article3 = Object.assign(objectifyAndStripId(article1), {
				link: '123',
			});

			const changes = normalizedDiff(article1, article3);
			expect(changes).to.have.length(1);
		});
	});
});

describe('upsertManyPosts', () => {
	const rssID = '5b0ad0baf6f89574a638887f';
	let articles;

	before(async () => {
		await dropDBs();
		await RSS.create({
			_id: rssID,
			title: 'RSS',
			feedUrl: 'http://amazon.com',
		});

		let insertedArticles = await Article.find({ rss: rssID }).sort('fingerprint');
		expect(insertedArticles).to.be.empty;
		articles = CreateFingerPrints(
			Array.from(Array(5).keys()).map(i => {
				const article = new Article({
					rss: rssID,
					title: `Article #${i}`,
					description: 'Article about life the universe and everything',
					url: `http://google.com/${i}`,
					link: `http://google.com/${i}`,
					guid: `http://google.com/${i}`,
				});
				article.enclosures = [];
				return article;
			}), 'STABLE'
		);
		insertedArticles = await Article.find({ rss: rssID }).sort('fingerprint');
		expect(insertedArticles).to.be.empty;
	});

	it('should insert articles', async () => {
		await upsertManyPosts(rssID, articles, 'rss');

		const insertedArticles = await Article.find({ rss: rssID }).sort('fingerprint');
		expect(insertedArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(insertedArticles[i].url).to.be.equal(articles[i].url);
			expect(insertedArticles[i].title).to.be.equal(articles[i].title);
			expect(insertedArticles[i].description).to.be.equal(articles[i].description);
			expect(insertedArticles[i].fingerprint).to.be.equal(articles[i].fingerprint);
		}
	});

	it('should update articles', async () => {
		for (let i in articles) {
			articles[i]._id = mongoose.Types.ObjectId();
			articles[i].title = `Article №${i}`;
			articles[i].description = 'Article about pugs';
		}
		CreateFingerPrints(articles, 'STABLE');
		await upsertManyPosts(rssID, articles, 'rss');

		const updatedArticles = await Article.find({ rss: rssID }).sort('fingerprint');
		expect(updatedArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(updatedArticles[i].url).to.be.equal(articles[i].url);
			expect(updatedArticles[i].title).to.be.equal(articles[i].title);
			expect(updatedArticles[i].description).to.be.equal(articles[i].description);
			expect(updatedArticles[i].fingerprint).to.be.equal(articles[i].fingerprint);
		}
	});

	it('should only upsert articles w/ either new guid or content hash affecting fields', async () => {
		// no data changed = no actions
		const nonUpdateResult = await upsertManyPosts(rssID, articles, 'rss');
		expect(nonUpdateResult.new).to.be.empty;
		expect(nonUpdateResult.changed).to.be.empty;
		let existingArticles = await Article.find({ rss: rssID });
		expect(existingArticles).to.have.length(articles.length);

		// content changed = update
		for (let i in articles) {
			articles[i]._id = mongoose.Types.ObjectId();
			articles[i].content = `c${i}`;
		}
		CreateFingerPrints(articles, 'STABLE');
		const newHashResult = await upsertManyPosts(rssID, articles, 'rss');
		expect(newHashResult.new).to.be.empty;
		expect(newHashResult.changed).to.not.be.empty;
		existingArticles = await Article.find({ rss: rssID }).sort('fingerprint');
		expect(existingArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(existingArticles[i].fingerprint).to.be.equal(articles[i].fingerprint);
		}

		// url changed content stayed the same = insert
		for (let i in articles) {
			articles[i]._id = mongoose.Types.ObjectId();
			articles[i].url = `http://google.com/${i}/`;
			articles[i].link = `http://google.com/${i}/`;
			articles[i].guid = `http://google.com/${i}/`;
		}
		CreateFingerPrints(articles, 'STABLE');
		const insertResult = await upsertManyPosts(rssID, articles, 'rss');
		expect(insertResult.new).to.not.be.empty;
		expect(insertResult.changed).to.be.empty;
		const newArticles = await Article.find({
			rss: rssID,
			_id: { $nin: existingArticles.map(a => String(a._id)) },
		}).sort('fingerprint');
		expect(newArticles).to.have.length(articles.length);
		for (let i in articles) {
			expect(newArticles[i].url).to.be.equal(articles[i].url);
			expect(newArticles[i].title).to.be.equal(articles[i].title);
			expect(newArticles[i].description).to.be.equal(articles[i].description);
			expect(newArticles[i].fingerprint).to.be.equal(articles[i].fingerprint);
		}
	});
});
