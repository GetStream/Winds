import { expect } from 'chai';

import { getTestFeed } from '../utils';
import { ReadFeedStream, ParseFeedPosts, ParsePodcastPosts } from '../../src/parsers/feed';

describe('Parsing', () => {
	describe('RSS', () => {
		it('should parse TechCrunch', async () => {
			const tc = getTestFeed('techcrunch');

			const posts = await ReadFeedStream(tc);
			const feedResponse = ParseFeedPosts(posts);

			expect(feedResponse.articles.length).to.equal(20);
			expect(feedResponse.title).to.equal('TechCrunch');
			expect(feedResponse.link).to.equal('https://techcrunch.com/');
		});
		it('should parse /r/programming', async () => {
			const posts = await ReadFeedStream(getTestFeed('reddit_programming'));
			const feedResponse = ParseFeedPosts(posts);

			expect(feedResponse.articles.length).to.equal(25);
			expect(feedResponse.title).to.equal('/r/programming');
			expect(feedResponse.link).to.equal('https://www.reddit.com/r/programming/');
			expect(feedResponse.description).to.equal('Computer Programming');

			const a = feedResponse.articles[0];
			expect(a.title.slice(0, 20)).to.equal('GitHub was also talk');
			expect(a.url).to.equal(
				'https://reddit.com/r/programming/comments/8oryk9/github_was_also_talking_to_google_about_a_deal',
			);
		});
	});

	describe('Podcast', () => {
		it('should parse GiantBomcast', async () => {
			const bomcast = getTestFeed('giant-bomcast');

			const posts = await ReadFeedStream(bomcast);
			const podcastResponse = ParsePodcastPosts(posts);

			expect(podcastResponse.title).to.equal('Giant Bombcast');
			expect(podcastResponse.link).to.equal('https://www.giantbomb.com/');
			const e = podcastResponse.episodes[0];
			expect(e.description.slice(0, 20)).to.equal('Back on up to the lo');
			expect(e.enclosure).to.equal(
				'https://dts.podtrac.com/redirect.mp3/www.giantbomb.com/podcasts/download/2347/Giant_Bombcast_534__Forklift_Academy-05-29-2018-5923302638.mp3',
			);
			expect(e.link).to.equal(
				'https://www.giantbomb.com/podcasts/giant-bombcast-534-forklift-academy/1600-2347/',
			);
		});
	});
});
