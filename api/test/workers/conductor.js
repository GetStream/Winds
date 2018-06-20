import moment from 'moment';
import { expect } from 'chai';

import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import { conduct } from '../../src/workers/conductor';
import { RssQueueAdd, PodcastQueueAdd } from '../../src/asyncTasks';
import { loadFixture, dropDBs } from '../utils';

describe('Conductor worker', () => {
	const beforeDeadline = moment().subtract(16, 'minutes').toDate();
	const afterDeadline = moment().subtract(14, 'minutes').toDate();
	let RssQueueAddFn;
	let PodcastQueueAddFn;

	before(() => {
		RssQueueAddFn = RssQueueAdd._fn;
		PodcastQueueAddFn = PodcastQueueAdd._fn;
		RssQueueAdd._fn = PodcastQueueAdd._fn = () => Promise.resolve();
	});

	after(() => {
		RssQueueAdd._fn = RssQueueAddFn;
		PodcastQueueAdd._fn = PodcastQueueAddFn;
	});

	beforeEach(async () => {
		await dropDBs();
		RssQueueAdd.resetHistory();
		PodcastQueueAdd.resetHistory();
	});

	it('should only touch data updated later then 15 minutes ago', async () => {
		const rssBefore = await RSS.create({
			title: "RSS feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline
		});
		const podcastBefore = await Podcast.create({
			title: "Podcast feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: afterDeadline
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		expect(rssAfter.isParsing).to.be.true;
		expect(podcastAfter.isParsing).to.be.false;
		expect(Number(rssAfter.updatedAt)).to.not.be.equal(Number(rssBefore.updatedAt));
		expect(Number(podcastAfter.updatedAt)).to.be.equal(Number(podcastBefore.updatedAt));
	});

	it('should only touch data followed by someone', async () => {
		const rssBefore = await RSS.create({
			title: "RSS feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline
		});
		const podcastBefore = await Podcast.create({
			title: "Podcast feed",
			valid: true,
			isParsing: false,
			followerCount: 0,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		expect(rssAfter.isParsing).to.be.true;
		expect(podcastAfter.isParsing).to.be.false;
		expect(Number(rssAfter.updatedAt)).to.not.be.equal(Number(rssBefore.updatedAt));
		expect(Number(podcastAfter.updatedAt)).to.be.equal(Number(podcastBefore.updatedAt));
	});

	it('should only schedule data scraping if its not in the process of parsing', async () => {
		const rssBefore = await RSS.create({
			title: "RSS feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline
		});
		const podcastBefore = await Podcast.create({
			title: "Podcast feed",
			valid: true,
			isParsing: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		expect(rssAfter.isParsing).to.be.true;
		expect(Number(rssAfter.updatedAt)).to.not.be.equal(Number(rssBefore.updatedAt));
		expect(Number(podcastAfter.updatedAt)).to.be.equal(Number(podcastBefore.updatedAt));
	});

	it('should touch at most 1/15 of dataset at a time', async () => {
		const rss = await Promise.all(Array.from(Array(30).keys()).map(i => {
			return RSS.create({
				title: `RSS feed #${i}`,
				valid: true,
				isParsing: false,
				followerCount: 2,
				consecutiveScrapeFailures: 0,
				feedUrl: `http://google.com/${i}`,
				lastScraped: beforeDeadline
			});
		}));

		await conduct();

		const updatedRss = await RSS.count({ isParsing: true });
		expect(updatedRss).to.be.below(3);
	});

	it('should take at least 15 invocations to touch all dataset', async () => {
		const rss = await Promise.all(Array.from(Array(30).keys()).map(i => {
			return RSS.create({
				title: `RSS feed #${i}`,
				valid: true,
				isParsing: false,
				followerCount: 2,
				consecutiveScrapeFailures: 0,
				feedUrl: `http://google.com/${i}`,
				lastScraped: beforeDeadline
			});
		}));

		for (let i = 1; i <= 14; ++i) {
			await conduct();
			const updatedRss = await RSS.count({ isParsing: true });
			expect(updatedRss).to.be.below(i * 2 + 1);
		}

		await conduct();
		const updatedRss = await RSS.count({ isParsing: true });
		expect(updatedRss).to.be.equal(30);
	});

	it('should schedule data for scraping with appropriate worker', async () => {
		const publicationOptions = { removeOnComplete: true, removeOnFail: true };
		const rss = await RSS.create({
			title: "RSS feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline
		});
		const podcast = await Podcast.create({
			title: "Podcast feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline
		});
		const rssJob = { rss: rss._id, url: rss.feedUrl };
		const podcastJob = { podcast: podcast._id, url: podcast.feedUrl };

		await conduct();

		expect(RssQueueAdd.calledOnceWith(rssJob, publicationOptions)).to.be.true;
		expect(PodcastQueueAdd.calledOnceWith(podcastJob, publicationOptions)).to.be.true;
	});

	it('should only touch data with less then 64 consecutive scrape failures', async () => {
		const rssBefore = await RSS.create({
			title: "RSS feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline
		});
		const podcastBefore = await Podcast.create({
			title: "Podcast feed",
			valid: true,
			isParsing: false,
			followerCount: 2,
			consecutiveScrapeFailures: 65,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		expect(rssAfter.isParsing).to.be.true;
		expect(podcastAfter.isParsing).to.be.false;
		expect(Number(rssAfter.updatedAt)).to.not.be.equal(Number(rssBefore.updatedAt));
		expect(Number(podcastAfter.updatedAt)).to.be.equal(Number(podcastBefore.updatedAt));
	});
});
