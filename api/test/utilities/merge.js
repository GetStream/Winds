import { expect } from 'chai';
import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import Follow from '../../src/models/follow';

import Pin from '../../src/models/pin';
import Article from '../../src/models/article';

import logger from '../../src/utils/logger';

import { loadFixture, getMockClient, getMockFeed, dropDBs } from '../utils';
import {mergeFeeds} from '../../src/utils/merge'


describe('Merge', () => {


	it('should merge two feeds', async () => {
    dropDBs()
    await loadFixture('initial-data');
    // verify we follow and pin stuff from feed B
    let articleCount = await Article.count({rss: "5b0ad0baf6f89574a638887a"})
    let followCount = await Follow.count({rss: "5b0ad0baf6f89574a638887a"})

    let results = await mergeFeeds("5b0ad0baf6f89574a638887b", "5b0ad0baf6f89574a638887a")
    // verify we now follow and pin stuff from feed A



	});

});
