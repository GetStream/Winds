import nock from 'nock';
import { expect } from 'chai';

import { podcastQueue, StreamQueueAdd, OgQueueAdd } from '../../src/asyncTasks';
import Podcast from '../../src/models/podcast';
import Episode from '../../src/models/episode';
import { ParsePodcast } from '../../src/parsers/feed';
import { podcastProcessor, handlePodcast } from '../../src/workers/podcast';
import { loadFixture, dropDBs, getTestPodcast, getMockFeed } from '../utils';

describe('Podcast worker', () => {
	const data = {
		podcast: '5afb7fedfe7430d35996d66e',
		url: 'https://anchor.fm/s/1f47f58/podcast/rss',
	};

	let originalOgQueueAdd;
	let originalStreamQueueAdd;
	let handler;
	let initialEpisodes;

	function setupHandler() {
		handler = new Promise((resolve, reject) => {
			podcastQueue.handlers['__default__'] = job => {
				return handlePodcast(job).then(resolve, reject);
			};
		});
	}

	before(async () => {
		await podcastQueue.empty();
		originalOgQueueAdd = OgQueueAdd._fn;
		originalStreamQueueAdd = StreamQueueAdd._fn;
		OgQueueAdd._fn = () => Promise.resolve();
		StreamQueueAdd._fn = () => Promise.resolve();

		podcastQueue.process(podcastProcessor).catch(err => console.log(`PODCAST PROCESSING FAILURE: ${err.stack}`));

		await dropDBs();
		await loadFixture('initial-data');

		initialEpisodes = await Episode.find({ podcast: data.podcast });
	});

	after(async () => {
		podcastQueue.handlers['__default__'] = podcastProcessor;
		await podcastQueue.close();
		OgQueueAdd._fn = originalOgQueueAdd;
		StreamQueueAdd._fn = originalStreamQueueAdd;
	});

	describe('queue', () => {
		it('should call worker when enqueueing jobs', async () => {
			setupHandler();

			await podcastQueue.add(data);
			await handler;

			const episodes = await Episode.find({ podcast: data.podcast });
			expect(episodes).to.have.length.above(initialEpisodes.length);
		});

		it('should fail for invalid job', async () => {
			const testCases = [
				{ podcast: '5afb7fedfe7430d35996d66e', url: undefined },
				{ podcast: '5afb7fedfe7430d35996d66e', url: '' },
				{ podcast: '5afb7fedfe7430d35996d66e', url: 'http://dorkly.com/comics/rssss' },
			];

			for (let i = 0; i < testCases.length; ++i) {
				setupHandler();

				const data = testCases[i];
				await podcastQueue.add(data);
				try {
					await handler;
				} catch (_) {
					//XXX: ignore error
				}

				const podcast = await Podcast.findById(data.podcast);
				expect(podcast.consecutiveScrapeFailures, `test case #${i + 1}`).to.be.an.equal(i + 1);
			}
		});
	});

	describe('worker', () => {
		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');

			initialEpisodes = await Episode.find({ podcast: data.podcast });

			nock(data.url)
				.get('')
				.twice()
				.reply(200, () => {
					return getTestPodcast('giant-bombcast');
				});

			getMockFeed('podcast', data.podcast).addActivities.resetHistory();
			ParsePodcast.resetHistory();
			OgQueueAdd.resetHistory();
			StreamQueueAdd.resetHistory();
			setupHandler();

			await podcastQueue.add(data);
			await handler;
		});

		after(() => {
			nock.cleanAll();
		});

		it('should parse the feed', async () => {
			expect(ParsePodcast.calledWith(data.url)).to.be.true;
		});

		it('should upsert episode data from feed', async () => {
			const episodes = await Episode.find({ podcast: data.podcast });
			expect(episodes).to.have.length(initialEpisodes.length + 649);
		});

		it('should update feed data', async () => {
			const podcast = await Podcast.findById(data.podcast);
			expect(podcast.postCount).to.be.equal(initialEpisodes.length + 649);
		});

		it('should add episode data to Stream feed', async () => {
			const feed = getMockFeed('podcast', data.podcast);
			expect(feed).to.not.be.null;
			expect(feed.addActivities.called).to.be.true;

			const episodes = await Episode.find({
				_id: { $nin: initialEpisodes.map(a => a._id) },
				podcast: data.podcast,
			});
			const batchCount = Math.ceil(episodes.length / 100);
			const foreignIds = episodes.map(e => `episodes:${e._id}`);
			let matchedActivities = 0;
			for (let i = 0; i < batchCount; ++i) {
				const batchSize = Math.min(100, episodes.length - i * 100);
				const args = feed.addActivities.getCall(i).args[0].map(a => a.foreign_id);
				expect(args).to.have.length(batchSize);
				matchedActivities += args.filter(arg => foreignIds.includes(arg)).length;
			}
			expect(matchedActivities).to.equal(episodes.length);
		});

		it('should schedule OG job', async () => {
			const episodes = await Episode.find({
				_id: { $nin: initialEpisodes.map(a => a._id) },
				podcast: data.podcast,
			});
			const opts = { removeOnComplete: true, removeOnFail: true };
			const args = { type: 'episode', podcast: data.podcast, urls: episodes.map(e => e.link) };
			expect(OgQueueAdd.calledOnceWith(args, opts)).to.be.true;
		});

		it('should schedule Stream job', async () => {
			const episodes = await Episode.find({
				_id: { $nin: initialEpisodes.map(a => a._id) },
				podcast: data.podcast,
			});
			const opts = { removeOnComplete: true, removeOnFail: true };
			const args = { podcast: data.podcast, contentIds: episodes.map(e => e._id) };
			expect(StreamQueueAdd.calledOnceWith(args, opts)).to.be.true;
		});
	});
});
