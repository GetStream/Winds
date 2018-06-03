import { expect, request } from 'chai';

import api from '../../src/server';
import auth from '../../src/controllers/auth';
import Podcast from '../../src/models/podcast';
import RSS from '../../src/models/rss';
import User from '../../src/models/user';
import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';
import fs from 'fs';
import path from 'path';
import FeedParser from 'feedparser';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import { IsPodcastStream } from '../../src/parsers/detect-type';
import { DetectLangFromStream } from '../../src/parsers/detect-language';

function getTestFeed(name) {
	let p = path.join(__dirname, '..', 'data', 'feed', name);
	let feedStream = fs.createReadStream(p);
	return feedStream;
}

describe('Language detection', () => {
	let response;
	let user;

	it('should detect language from techcrunch', async () => {
		let tc = getTestFeed('techcrunch');
		let result = await DetectLangFromStream(tc);
		expect(result).to.equal("eng");
	});

  it('should detect language from lemonde', async () => {
    let tc = getTestFeed('lemonde');
    let result = await DetectLangFromStream(tc);
    expect(result).to.equal("fra");
  });

  it('should detect language from habr', async () => {
    let tc = getTestFeed('habr');
    let result = await DetectLangFromStream(tc);
    expect(result).to.equal("rus");
  });
});
