import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import { sendFeedToCollections } from '../../src/utils/collections';
import { loadFixture, dropDBs } from '../utils';

describe('Collections', () => {
	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
	});

	describe('Update collection', () => {
		it('should update the rss collection', async () => {
			await sendFeedToCollections('rss', await RSS.findOne());
		});

		it('should update the podcast collection', async () => {
			await sendFeedToCollections('podcast', await Podcast.findOne());
		});
	});
});
