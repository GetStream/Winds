import {
	sendRssFeedToCollections,
	sendPodcastToCollections,
} from '../../src/utils/collections';
import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import { loadFixture, dropDBs, getTestFeed, getTestPodcast } from '../utils';

describe('Collections', () => {
	let rss, podcast;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
		rss = await RSS.findOne();
		podcast = await Podcast.findOne();
	});

	describe('Update collection', () => {
		it('should update the rss collection', async () => {
			await sendRssFeedToCollections(rss);
		});
		it('should update the podcast collection', async () => {
			await sendPodcastToCollections(podcast);
		});
	});
});
