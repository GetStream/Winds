import { expect, request } from 'chai';

import api from '../../src/server';
import auth from '../../src/controllers/auth';
import Podcast from '../../src/models/podcast';
import RSS from '../../src/models/rss';
import User from '../../src/models/user';
import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';
import fs from 'fs';
import path from 'path';
import FeedParser from 'feedparser';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import { IsPodcastStream } from '../../src/parsers/detect-type';
import { ReadFeedStream, ParseFeedPosts, ParsePodcastPosts } from '../../src/parsers';

function getTestFeed(name) {
	let p = path.join(__dirname, '..', 'data', 'feed', name);
	let feedStream = fs.createReadStream(p);
	return feedStream;
}

describe('Parsing', () => {
	describe('Feed', () => {
		describe('valid request', () => {
			let response;
			let user;

			it('should parse TechCrunch', async () => {
				let tc = getTestFeed('techcrunch');

				let posts = await ReadFeedStream(tc);
				let feedResponse = ParseFeedPosts(posts);

				expect(feedResponse.articles.length).to.equal(20);
				expect(feedResponse.title).to.equal('TechCrunch');
				expect(feedResponse.link).to.equal('https://techcrunch.com/');
			});
		});
	});
	describe('Podcast', () => {
		describe.only('valid request', () => {
			let response;
			let user;

			it('should parse GiantBomcast', async () => {
				let bomcast = getTestFeed('giant-bomcast');

				let posts = await ReadFeedStream(bomcast);
				let podcastResponse = ParsePodcastPosts(posts);

				expect(podcastResponse.title).to.equal('Giant Bombcast');
				expect(podcastResponse.link).to.equal('https://www.giantbomb.com/');
				let e = podcastResponse.episodes[0];
				expect(e.description.slice(0,20)).to.equal('Back on up to the lo');
				expect(e.enclosure).to.equal('https://dts.podtrac.com/redirect.mp3/www.giantbomb.com/podcasts/download/2347/Giant_Bombcast_534__Forklift_Academy-05-29-2018-5923302638.mp3');
				expect(e.link).to.equal('https://www.giantbomb.com/podcasts/giant-bombcast-534-forklift-academy/1600-2347/');
			});
		});
	});
});
