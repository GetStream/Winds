import { expect } from 'chai';

import Follow from '../../src/models/follow';
import Article from '../../src/models/article';
import { mergeFeeds } from '../../src/utils/merge';
import { loadFixture, dropDBs } from '../utils';

describe('Merge *WIP*', () => {
	it.skip('should merge two feeds', async () => {
		await dropDBs();
		await loadFixture('initial-data');
		//TODO: verify we follow and pin stuff from feed B
		let articleCount = await Article.count({ rss: '5b0ad0baf6f89574a638887a' });
		let followCount = await Follow.count({ rss: '5b0ad0baf6f89574a638887a' });

		let results = await mergeFeeds('5b0ad0baf6f89574a638887b', '5b0ad0baf6f89574a638887a');
		//TODO: verify we now follow and pin stuff from feed A
	});
});
