import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import Article from '../../src/models/article';
import Episode from '../../src/models/episode';
import { sendFeedToCollections } from '../../src/utils/collections';
import { loadFixture, dropDBs } from '../utils';

describe('Collections', () => {
	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
	});

	describe('Update collection', () => {
		it('should update the rss collection', async () => {
			const rss = await RSS.findOne();
			const content = await Article.find({ rss: rss._id })
				.sort({ publicationDate: -1 })
				.limit(1000);
			await sendFeedToCollections('rss', rss, content);
		});

		it('should update the podcast collection', async () => {
			const podcast = await Podcast.findOne();
			const content = await Article.find({ podcast: podcast._id })
				.sort({ publicationDate: -1 })
				.limit(1000);
			await sendFeedToCollections('podcast', podcast, content);
		});
	});
});
