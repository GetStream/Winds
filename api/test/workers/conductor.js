import moment from 'moment';
import { expect } from 'chai';

import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import { conduct } from '../../src/workers/conductor';
import { tryAddToQueueFlagSet, getQueueFlagSetMembers } from '../../src/utils/queue';
import { RssQueueAdd, PodcastQueueAdd } from '../../src/asyncTasks';
import { loadFixture, dropDBs } from '../utils';

function beforeDeadline() {
	return moment()
		.subtract(3, 'minutes')
		.toDate();
}

function afterDeadline() {
	return moment()
		.subtract(1, 'minutes')
		.toDate();
}

describe('Conductor worker', () => {
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

	it('should only touch data updated later then one scrape interval ago', async () => {
		const rssBefore = await RSS.create({
			title: 'RSS feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline(),
		});
		const podcastBefore = await Podcast.create({
			title: 'Podcast feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: afterDeadline(),
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		const busyRss = new Set(await getQueueFlagSetMembers('rss'));
		const busyPodcasts = new Set(await getQueueFlagSetMembers('podcast'));
		expect(busyRss.has(`${rssAfter._id}:rss`)).to.be.true;
		expect(busyPodcasts.has(`${podcastAfter._id}:podcast`)).to.be.false;
	});

	it('should only touch data followed by someone', async () => {
		const rssBefore = await RSS.create({
			title: 'RSS feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline(),
		});
		const podcastBefore = await Podcast.create({
			title: 'Podcast feed',
			valid: true,
			followerCount: 0,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline(),
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		const busyRss = new Set(await getQueueFlagSetMembers('rss'));
		const busyPodcasts = new Set(await getQueueFlagSetMembers('podcast'));
		expect(busyRss.has(`${rssAfter._id}:rss`)).to.be.true;
		expect(busyPodcasts.has(`${podcastAfter._id}:podcast`)).to.be.false;
	});

	it('should only schedule data scraping if its not in the process of parsing', async () => {
		const rssBefore = await RSS.create({
			title: 'RSS feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline(),
		});
		const podcastBefore = await Podcast.create({
			title: 'Podcast feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline(),
		});
		await tryAddToQueueFlagSet('podcast', 'podcast', podcastBefore._id);

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);

		const busyRss = new Set(await getQueueFlagSetMembers('rss'));
		expect(busyRss.has(`${rssAfter._id}:rss`)).to.be.true;
		expect(RssQueueAdd.called).to.be.true;
		expect(PodcastQueueAdd.called).to.be.false;
	});

	it('should touch at most 1/15 of dataset at a time', async () => {
		await Promise.all(
			Array.from(Array(15).keys()).map(async i => {
				await RSS.create({
					title: `RSS feed #${i}`,
					valid: true,
					followerCount: 2,
					consecutiveScrapeFailures: 0,
					feedUrl: `http://google.com/${i}`,
					lastScraped: beforeDeadline(),
				});
				await RSS.create({
					title: `RSS popular feed #${i}`,
					valid: true,
					followerCount: 102,
					consecutiveScrapeFailures: 0,
					feedUrl: `http://google.com/${i}`,
					lastScraped: beforeDeadline(),
				});
			}),
		);

		await conduct();

		const busyRss = new Set(await getQueueFlagSetMembers('rss'));
		expect(busyRss.size).to.be.below(3);
	});

	it('should take at least 15 invocations to touch all dataset', async () => {
		await Promise.all(
			Array.from(Array(15).keys()).map(async i => {
				await RSS.create({
					title: `RSS feed #${i}`,
					valid: true,
					followerCount: 2,
					consecutiveScrapeFailures: 0,
					feedUrl: `http://google.com/${i}`,
					lastScraped: beforeDeadline(),
				});
				await RSS.create({
					title: `RSS popular feed #${i}`,
					valid: true,
					followerCount: 102,
					consecutiveScrapeFailures: 0,
					feedUrl: `http://google.com/${i}`,
					lastScraped: beforeDeadline(),
				});
			}),
		);

		for (let i = 1; i <= 14; ++i) {
			await conduct();
			const busyRss = new Set(await getQueueFlagSetMembers('rss'));
			expect(busyRss.size).to.be.below(i * 2 + 1);
		}

		await conduct();
		const busyRss = new Set(await getQueueFlagSetMembers('rss'));
		expect(busyRss.size).to.be.equal(30);
	});

	it('should schedule data for scraping with appropriate worker', async () => {
		const publicationOptions = { removeOnComplete: true, removeOnFail: true };
		const rss = await RSS.create({
			title: 'RSS feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline(),
		});
		const podcast = await Podcast.create({
			title: 'Podcast feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline(),
		});
		const rssJob = { rss: rss._id, url: rss.feedUrl };
		const podcastJob = { podcast: podcast._id, url: podcast.feedUrl };

		await conduct();

		expect(RssQueueAdd.calledOnceWith(rssJob, publicationOptions)).to.be.true;
		expect(PodcastQueueAdd.calledOnceWith(podcastJob, publicationOptions)).to.be.true;
	});

	it('should only touch data with less then 64 consecutive scrape failures', async () => {
		const rssBefore = await RSS.create({
			title: 'RSS feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 0,
			feedUrl: 'http://google.com',
			lastScraped: beforeDeadline(),
		});
		const podcastBefore = await Podcast.create({
			title: 'Podcast feed',
			valid: true,
			followerCount: 2,
			consecutiveScrapeFailures: 65,
			feedUrl: 'http://bing.com',
			lastScraped: beforeDeadline(),
		});

		await conduct();

		const rssAfter = await RSS.findById(rssBefore._id);
		const podcastAfter = await Podcast.findById(podcastBefore._id);

		const busyRss = new Set(await getQueueFlagSetMembers('rss'));
		const busyPodcasts = new Set(await getQueueFlagSetMembers('podcast'));
		expect(busyRss.has(`${rssAfter._id}:rss`)).to.be.true;
		expect(busyPodcasts.has(`${podcastAfter._id}:podcast`)).to.be.false;
	});
});
