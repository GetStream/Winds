import { expect } from 'chai';
import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import Follow from '../../src/models/follow';

import Pin from '../../src/models/pin';
import Article from '../../src/models/article';
import Episode from '../../src/models/episode';

import mongoose from 'mongoose';

import logger from '../../src/utils/logger';

import { loadFixture, getMockClient, getMockFeed, dropDBs } from '../utils';
import { postChanged, upsertManyPosts } from '../../src/utils/upsert';
import { getTestFeed, getTestPodcast } from '../utils';
import {
	ReadFeedStream,
	ParseFeedPosts,
	ParsePodcastPosts,
} from '../../src/parsers/feed';

describe('Upsert', () => {
	let article1, article2, episode1;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		article1 = await Article.findOne({ _id: '5b0ad37226dc3db38194e5ec' }).lean();
		article2 = await Article.findOne({ _id: '5b0ad37226dc3db38194e5ed' }).lean();
		episode1 = await Episode.findOne().lean();
	});

	describe('upsertManyPosts', () => {
		it('the same article shouldnt trigger an update', async () => {
			let operationMap = await upsertManyPosts(article1.rss, [article1], 'rss');
			expect(operationMap.changed.length).to.equal(0);
      expect(operationMap.new.length).to.equal(0);
		});
		it('url change should result in an update', async () => {
			article1.url = 'https://google.com/test';
			let operationMap = await upsertManyPosts(article1.rss, [article1], 'rss');
			expect(operationMap.changed.length).to.equal(1);
      expect(operationMap.new.length).to.equal(0);
		});
		it('publicationDate change shouldnt result in an update', async () => {
			article1.publicationDate = new Date();
			let operationMap = await upsertManyPosts(article1.rss, [article1], 'rss');
			expect(operationMap.changed.length).to.equal(0);
      expect(operationMap.new.length).to.equal(0);
		});
		it('a new article should be inserted', async () => {
      let article3 = article1
			article3.fingerprint = 'hello world';
			article3['_id'] = null
			article3.url = 'https://google.com/testhelloworld';
			let operationMap = await upsertManyPosts(article1.rss, [article3], 'rss');
			expect(operationMap.new.length).to.equal(1);
		});
	});

	describe('Episode upsertManyPosts', () => {
		it('the same episode shouldnt trigger an update', async () => {
			let operationMap = await upsertManyPosts(episode1.podcast, [episode1], 'podcast');
			expect(operationMap.changed.length).to.equal(0);
      expect(operationMap.new.length).to.equal(0);
		});
		it('a new episode should be inserted', async () => {
      let episode3 = episode1
			episode3.fingerprint = 'hello world';
			episode3['_id'] = null
			episode3.url = 'https://google.com/testhelloworld';
			let operationMap = await upsertManyPosts(episode1.podcast, [episode1], 'podcast');
			expect(operationMap.new.length).to.equal(1);
		});
	})

	describe('Double Inserts RSS feed', () => {

		// loop over feeds, and verify that the 2nd insert has 0 changes
		// this will break if something is wrong with the upsert/change detection
		for (let f of ['techcrunch', 'reddit-r-programming', 'hackernews', 'medium-technology']) {
			it(`the second run should be unchanged for ${f}`, async () => {
				let posts = await ReadFeedStream(getTestFeed(f));
				let feedResponse = ParseFeedPosts(posts);
				let articles = feedResponse.articles

				for (let a of articles) {
					a['rss'] = '5b0ad37226dc3db38194e5ef'
				}
				await upsertManyPosts('5b0ad37226dc3db38194e5ef', articles, 'rss');
				let operationMap = await upsertManyPosts('5b0ad37226dc3db38194e5ef', articles, 'rss');
				expect(operationMap.new.length).to.equal(0)
				expect(operationMap.changed.length).to.equal(0)
			});
		}
	})

	describe('Double Inserts Podcasts', () => {

		// loop over feeds, and verify that the 2nd insert has 0 changes
		// this will break if something is wrong with the upsert/change detection
		for (let f of ['giant-bombcast', 'serial', 'a16z']) {
			it(`the second run should be unchanged for ${f}`, async () => {
				let posts = await ReadFeedStream(getTestPodcast(f));
				let feedResponse = ParsePodcastPosts(posts);
				let episodes = feedResponse.episodes

				for (let e of episodes) {
					e['podcast'] = '5b0ad37226dc3db38194e5ef'
				}
				await upsertManyPosts('5b0ad37226dc3db38194e5ef', episodes, 'podcast');
				let operationMap = await upsertManyPosts('5b0ad37226dc3db38194e5ef', episodes, 'podcast');
				expect(operationMap.new.length).to.equal(0)
				expect(operationMap.changed.length).to.equal(0)
			});
		}
	})

	describe('postChanged diff function', () => {
		it('the diff between these 2 articles should be 4', async () => {
			let changes = postChanged(article1, article2);
			expect(changes).to.equal(3);
		});
		it('the diff between these 2 articles should be 0', async () => {
			let changes = postChanged(article1, article1);
			expect(changes).to.equal(0);
		});
		it('test if we ignore publication date', async () => {
			let article3 = Object.assign({}, article1);
			article3.publicationDate = new Date();
			let changes = postChanged(article1, article3);
			expect(changes).to.equal(0);
		});
		it('ensure we dont ignore other fields', async () => {
			let article3 = Object.assign({}, article1);
			article3.link = '123';
			let changes = postChanged(article1, article3);
			expect(changes).to.equal(1);
		});
	});
});
