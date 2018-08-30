import { expect } from 'chai';
import normalize from 'normalize-url';

import { getTestFeed, getTestPodcast } from '../utils';
import {
	ReadFeedStream,
	ParseFeedPosts,
	ParsePodcastPosts,
} from '../../src/parsers/feed';

// Test data is extracted from the original feeds. Modifications to accommodate acceptable internal changes (e.g. normalization) are noted.
const rssTestData = [
	{
		filename: 'techcrunch',
		expectations: {
			title: 'TechCrunch',
			link: 'https://techcrunch.com/',
			description: 'Startup and Technology News',
			articlesLength: 20,
			fingerprint: 'guid:f53cec9fa49a491db35dae6e10b85498',
			firstArticleUrl: 'https://techcrunch.com/2018/05/31/area-120-subway-pigeon',
			firstArticleTitle:
				'Google’s Area 120 incubator aims to improve your NYC subway commute with Pigeon',
		},
	},
	{
		filename: 'reddit-r-programming',
		expectations: {
			title: '/r/programming', // special-case for reddit feeds
			link: 'https://www.reddit.com/r/programming/',
			description: 'Computer Programming', // no description; description taken from subtitle
			articlesLength: 25,
			fingerprint: 'guid:8e55ca2e471abf0209050ea60b5f19ab',
			firstArticleUrl:
				'https://reddit.com/r/programming/comments/8oryk9/github_was_also_talking_to_google_about_a_deal', // normalize-url drops 'www' subdomain, trailing slash
			firstArticleTitle:
				'GitHub was also talking to Google about a deal, but went with Microsoft instead',
		},
	},
	{
		filename: 'hackernews',
		expectations: {
			title: 'Hacker News',
			link: 'https://news.ycombinator.com/',
			description: 'Links for the intellectually curious, ranked by readers.',
			articlesLength: 30,
			fingerprint: 'guid:f9a5c3ce2fd3f2cb3aced7c0d7332ea3',
			firstArticleUrl: 'https://gitea.io',
			firstArticleTitle: 'Gitea – Alternative to GitLab and GitHub',
		},
	},
	{
		filename: 'a16z',
		expectations: {
			title: 'Andreessen Horowitz',
			link: 'https://a16z.com/',
			description: 'Software Is Eating the World',
			articlesLength: 10,
			fingerprint: 'guid:0d1d4a53e6156a0250e6212700858984',
			firstArticleUrl: 'http://andrewchen.co/paid-marketing-addiction',
			firstArticleTitle:
				'How Startups Get Addicted to Paid Marketing (and How to Go Beyond the Local Max)',
		},
	},
	{
		filename: 'stream',
		expectations: {
			title: 'The Stream Blog',
			link: 'https://getstream.io/blog',
			description: 'Welcome to the Official Stream Blog.',
			articlesLength: 12,
			firstArticleUrl:
				'https://getstream.io/blog/try-out-the-stream-api-with-postman', // normalize-url drops trailing slash
			firstArticleTitle: 'Try out the Stream API with Postman',
		},
	},
	{
		filename: 'medium-technology',
		expectations: {
			title: 'Handpicked stories about Technology on Medium',
			link:
				'https://medium.com/topic/technology?source=rss-------8-----------------technology',
			description: 'Technology on Medium: The download.',
			articlesLength: 10,
			firstArticleUrl:
				'https://shift.newco.co/apple-wants-its-phones-back-d0d77142c7d?source=rss-------8-----------------technology',
			firstArticleTitle: 'Apple Wants Its Phones Back',
		},
	},
	{
		filename: 'hackernoon-daily-dev',
		expectations: {
			title: 'Software Development in Hacker Noon on Medium',
			link:
				'https://hackernoon.com/tagged/software-development?source=rss----3a8144eabfe3--software_development',
			description:
				'Latest stories tagged with Software Development in Hacker Noon on Medium',
			articlesLength: 10,
			firstArticleUrl:
				'https://hackernoon.com/surveyjs-plugin-for-wordpress-9f42d9219db0?source=rss----3a8144eabfe3--software_development',
			firstArticleTitle: 'SurveyJS plugin for Wordpress',
		},
	},
	{
		filename: 'lobsters',
		expectations: {
			title: 'Lobsters',
			link: 'https://lobste.rs/',
			description: null, // empty description; no subtitle
			articlesLength: 25,
			firstArticleUrl: 'https://jwz.org/blog/2018/06/lol-github', // normalize-url drops 'www' subdomain, trailing slash
			firstArticleTitle: "JWZ's snarky, but relevant take on Github",
		},
	},
	{
		filename: 'django',
		expectations: {
			title: 'The Django weblog',
			link: 'https://www.djangoproject.com/weblog/',
			description: 'Latest news about Django, the Python Web framework.',
			articlesLength: 10,
			firstArticleUrl:
				'https://djangoproject.com/weblog/2018/jun/01/bugfix-release', // normalize-url drops 'www' subdomain, trailing slash
			firstArticleTitle: 'Django bugfix release: 2.0.6',
		},
	},
	{
		filename: 'ruby-on-rails',
		expectations: {
			title: 'Riding Rails',
			link: 'https://weblog.rubyonrails.org/',
			description: null, // no description or subtitle
			articlesLength: 10,
			firstArticleUrl:
				'https://weblog.rubyonrails.org/2018/5/27/this-week-in-rails-enumerable-index_with-transaction-fixes-and-more', // normalize-url drops trailing slash
			firstArticleTitle: 'Enumerable#index_with, transaction fixes, and more!',
		},
	},
	{
		filename: 'tmz',
		expectations: {
			title: 'TMZ.com',
			link: 'http://www.tmz.com/',
			description:
				'Celebrity Gossip and Entertainment News, Covering Celebrity News and Hollywood Rumors. Get All The Latest Gossip at TMZ - Thirty Mile Zone.',
			articlesLength: 20,
			firstArticleUrl:
				'http://tmz.com/2018/06/06/kate-spade-suicide-husband-andy-divorce-depressed', // normalize-url drops 'www' subdomain, trailing slash
			firstArticleTitle:
				'Kate Spade Depressed Before Suicide Because Husband Wanted a Divorce',
		},
	},
	{
		filename: 'treehugger-latest',
		expectations: {
			title: 'Latest Items from TreeHugger',
			link: 'https://www.treehugger.com/feeds/latest/',
			description: 'The most recent 30 items from TreeHugger',
			articlesLength: 30,
			firstArticleUrl:
				'https://treehugger.com/green-food/7-savory-recipes-use-rhubarb.html', // normalize-url drops 'www' subdomain
			firstArticleTitle: '7 savory recipes that use rhubarb',
		},
	},
	{
		filename: 'perezhilton',
		expectations: {
			title: 'PerezHilton',
			link: 'https://perezhilton.com',
			description:
				"Perez Hilton dishes up the juiciest celebrity gossip on all your favorite stars, from Justin Bieber to Kim Kardashian. Are you up-to-date on Hollywood's latest scandal?!",
			articlesLength: 10,
			firstArticleUrl:
				'http://perezhilton.com/2018-06-05-kate-spade-reta-saffo-sister-mental-illness-reported-suicide',
			firstArticleTitle:
				"Kate Spade's Sister Says The Designer Suffered From Years Of Mental Illness; Reported Suicide 'Not Unexpected'",
		},
	},
	{
		filename: 'kottke',
		expectations: {
			title: 'kottke.org',
			link: 'http://kottke.org/',
			description: "Jason Kottke's weblog, home of fine hypertext products", // no description; description taken from subtitle
			articlesLength: 40,
			firstArticleUrl:
				'https://kottke.org/18/06/ten-guidelines-for-nurturing-a-thriving-democracy-by-bertrand-russell',
			firstArticleTitle:
				'Ten guidelines for nurturing a thriving democracy by Bertrand Russell',
		},
	},
	{
		filename: 'boingboing',
		expectations: {
			title: 'Boing Boing',
			link: 'https://boingboing.net/', // FeedParser adds trailing slash
			description: 'Brain candy for Happy Mutants',
			articlesLength: 30,
			firstArticleUrl:
				'https://boingboing.net/2018/06/06/heres-how-the-hawaiian-isl.html',
			firstArticleTitle: "Here's how the Hawai'ian Islands formed",
		},
	},
	{
		filename: 'strava',
		expectations: {
			title: 'strava-engineering - Medium',
			link: 'https://medium.com/strava-engineering?source=rss----89d4108ce2a3---4',
			description: 'Engineers building the social network for athletes. - Medium',
			articlesLength: 10,
			firstArticleUrl:
				'https://medium.com/strava-engineering/apple-dev-guild-week-f5981fe525a4?source=rss----89d4108ce2a3---4',
			firstArticleTitle: 'Apple Dev Guild Week',
			firstArticlePublicationDate: new Date(Date.UTC(2018, 5, 4, 23, 55, 0)),
		},
	},
];

// Test data is extracted from the original feeds. Modifications to accommodate acceptable internal changes (e.g. normalization) are noted.
const podcastTestData = [
	{
		filename: 'giant-bombcast',
		expectations: {
			title: 'Giant Bombcast',
			link: 'https://www.giantbomb.com/', // FeedParser adds trailing slash
			image:
				'https://static.giantbomb.com/uploads/original/11/110673/2927815-3756859778-28940.png',
			episodesLength: 649,
			firstPodcastUrl:
				'https://giantbomb.com/podcasts/giant-bombcast-534-forklift-academy/1600-2347', // normalize-url drops 'www' subdomain, trailing slash
			firstPodcastTitle: 'Giant Bombcast 534: Forklift Academy',
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 4, 30, 0, 14, 0)), // Tue, 29 May 2018 16:14:00 PST --> Wed, 30 May 2018 00:14:00 GMT
		},
	},
	{
		filename: 'serial',
		expectations: {
			title: 'Serial',
			link: 'https://serialpodcast.org/', // FeedParser adds trailing slash
			image:
				'https://serialpodcast.org/sites/all/modules/custom/serial/img/serial-itunes-logo.png',
			episodesLength: 28,
			firstPodcastUrl:
				'http://feeds.serialpodcast.org/~r/serialpodcast/~3/Dx1_WiYrlg0/live',
			firstPodcastTitle: 'S-Town Is Live',
			firstPodcastPublicationDate: new Date(Date.UTC(2017, 2, 28, 13, 15, 0)), // Tue, 28 Mar 2017 13:15:00 +0000 --> Tue, 28 Mar 2017 13:15:00 GMT
		},
	},
	{
		filename: 'still-processing',
		expectations: {
			title: 'Still Processing',
			link: 'http://www.nytimes.com/podcasts/still-processing',
			image:
				'https://content.production.cdn.art19.com/images/44/f7/bb/b8/44f7bbb8-40ce-4a63-8ab8-9bc1cd71f4be/ba7aed20b307b76c2a8ba9a6473fd4c831179c6a24e20bf3179af4f11e06bc96968fca9edf17f4d55b5cae6ef3d97484f6b34b288426d42c5f59a515a8a37d67.jpeg',
			episodesLength: 74,
			firstPodcastUrl:
				'https://dts.podtrac.com/redirect.mp3/rss.art19.com/episodes/90f12a60-07c8-4c8d-ad93-90278046e861.mp3',
			firstPodcastTitle: "We Wouldn't Leave Kanye, But Should We?",
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 5, 7, 10, 0, 0)), // Thu, 07 Jun 2018 10:00:00 -0000 --> Thu, 07 Jun 2018 10:00:00 GMT
		},
	},
	{
		filename: 'nancy',
		expectations: {
			title: 'Nancy',
			link: 'http://www.wnycstudios.org/shows/nancy',
			image: 'https://media2.wnyc.org/i/raw/1/Nancy_WNYCStudios_1400a.png',
			episodesLength: 47,
			firstPodcastUrl: 'http://wnycstudios.org/story/queer-villains', // normalize-url drops 'www' subdomain, trailing slash
			firstPodcastTitle: '#43: Poor Unfortunate Souls',
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 5, 3, 16, 0, 0)), // Sun, 03 Jun 2018 12:00:00 -0400 --> Sun, 03 Jun 2018 16:00:00 GMT
		},
	},
	{
		filename: 'thehabitat',
		expectations: {
			title: 'The Habitat',
			link: 'https://www.gimletmedia.com/the-habitat',
			image:
				'http://static.megaphone.fm/podcasts/806b466c-ef0c-11e6-b531-afa5d3e8b9e3/image/uploads_2F1522339695064-fiy1a2pf3tb-64aa58ac9b5bcdcf9e3145121e2a85eb_2FTheHabitat-final-cover.png',
			episodesLength: 10,
			firstPodcastUrl: 'https://traffic.megaphone.fm/GLT4076252096.mp3',
			firstPodcastTitle: 'Bonus: This Is Not My First Rodeo',
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 4, 8, 1, 43, 0)), // Tue, 08 May 2018 01:43:00 -0000 --> Tue, 08 May 2018 01:43:00 GMT
		},
	},
	{
		filename: 'atlantamonster',
		expectations: {
			title: 'Atlanta Monster',
			link: 'http://atlantamonster.com/', // FeedParser adds trailing slash
			image:
				'http://static.megaphone.fm/podcasts/84e4a5c4-2de7-11e8-98b7-87f52d4374c4/image/uploads_2F1521733294980-xkcadcjrpar-7faa79cc84d505be934000c158cf54f5_2Fatlanta-monster-main-art.jpg',
			episodesLength: 17,
			firstPodcastUrl:
				'https://podtrac.com/pts/redirect.mp3/traffic.megaphone.fm/HSW7011693605.mp3', // normalize-url drops 'www' subdomain
			firstPodcastTitle: 'Live from SXSW',
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 4, 18, 4, 0, 0)), // Fri, 18 May 2018 04:00:00 -0000 --> Fri, 18 May 2018 04:00:00 GMT
		},
	},
	{
		filename: 'buffering-the-vampire-slayer',
		expectations: {
			title: 'Buffering the Vampire Slayer | A Buffy the Vampire Slayer Podcast',
			link: 'https://art19.com/shows/buffering-the-vampire-slayer',
			image:
				'https://content.production.cdn.art19.com/images/be/a6/a3/9f/bea6a39f-64ec-4a6f-9fba-80efbb45db2c/c9ca312ba4d3ac1415f0c0421adfce07829f7677e20fc272d3e421fb1c180fbc9dc9294d5aa3efa7480153c24daffca835fb436a1de59d4c9efb6453f111968f.jpeg',
			episodesLength: 70,
			firstPodcastUrl:
				'http://rss.art19.com/episodes/91aaef4e-5a1e-4aef-b66a-84432e29f9eb.mp3',
			firstPodcastTitle: '4.02: Living Conditions',
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 5, 6, 4, 0, 0)), // Wed, 06 Jun 2018 04:00:00 -0000 --> Wed, 06 Jun 2018 04:00:00 GMT
		},
	},
	{
		filename: 'making-obama',
		expectations: {
			title: 'Making Obama',
			link:
				'https://www.wbez.org/shows/making-obama/71b8de57-b2be-4e03-8481-683258de3ec1',
			image:
				'https://api.wbez.org/v2/images/6eb13711-5af1-4845-90ed-9dcd9a8e8da8.jpg?width=1400&height=1400',
			episodesLength: 15,
			firstPodcastUrl:
				'https://wbez.org/shows/making-obama/obama-bonus-the-decision/f15250d1-fccb-44e4-b14e-368525b08bfc', // normalize-url drops 'www' subdomain
			firstPodcastTitle: 'Obama BONUS: The Decision',
			firstPodcastPublicationDate: new Date(Date.UTC(2018, 3, 10, 5, 1, 0)), // Tue, 10 Apr 2018 05:01:00 GMT
		},
	},
];

describe('Parsing', () => {
	describe('RSS', () => {
		for (let test of rssTestData) {
			it(`should parse feed ${test.filename}`, async () => {
				let tc = getTestFeed(test.filename);
				let posts = await ReadFeedStream(tc);
				let feedResponse = ParseFeedPosts('', posts, 'STABLE');

				expect(feedResponse.title).to.equal(test.expectations.title);
				expect(feedResponse.link).to.equal(test.expectations.link);
				expect(feedResponse.description).to.equal(test.expectations.description);
				if (test.expectations.fingerprint) {
					expect(feedResponse.fingerprint).to.equal(
						test.expectations.fingerprint,
					);
				}

				expect(feedResponse.articles.length).to.equal(
					test.expectations.articlesLength,
				);
				expect(feedResponse.image).to.be.a('object');
				if (test.expectations.articlesLength > 0) {
					expect(feedResponse.articles[0].title).to.equal(
						test.expectations.firstArticleTitle,
					);
					expect(feedResponse.articles[0].url).to.equal(
						test.expectations.firstArticleUrl,
					);
					if (test.expectations.firstArticlePublicationDate) {
						expect(String(feedResponse.articles[0].publicationDate)).to.equal(
							String(test.expectations.firstArticlePublicationDate),
						);
					}
				}
			});
		}
	});

	describe('Podcast', () => {
		let response;
		let user;

		for (let test of podcastTestData) {
			it(`should parse podcast feed ${test.filename}`, async () => {
				let tc = getTestPodcast(test.filename);
				let posts = await ReadFeedStream(tc);
				let podcastResponse = ParsePodcastPosts('', posts, 'STABLE');

				expect(podcastResponse.title).to.equal(test.expectations.title);
				expect(podcastResponse.link).to.equal(test.expectations.link);
				expect(podcastResponse.image).to.equal(test.expectations.image);

				if (test.expectations.fingerprint) {
					expect(podcastResponse.fingerprint).to.equal(
						test.expectations.fingerprint,
					);
				}

				expect(podcastResponse.episodes.length).to.equal(
					test.expectations.episodesLength,
				);
				if (test.expectations.episodesLength > 0) {
					expect(podcastResponse.episodes[0].title).to.equal(
						test.expectations.firstPodcastTitle,
					);
					expect(podcastResponse.episodes[0].url).to.equal(
						test.expectations.firstPodcastUrl,
					);
					expect(podcastResponse.episodes[0].publicationDate).to.eql(
						test.expectations.firstPodcastPublicationDate,
					);
				}
			});
		}
	});
});
