import { expect } from 'chai';

import { IsPodcastStream } from '../../src/parsers/detect-type';
import { ParseOG, ParseOGStream } from '../../src/parsers/og';
import { getTestPage } from '../utils';

describe('OG parsing', () => {
	//TODO:
	// - different charset
	// - gzip

	it('should not detect og image from google', async () => {
		const tc = getTestPage('google.html');
		const result = await ParseOGStream(tc);
		expect(result).to.be.null;
	});

	it('should detect og image from techcrunch', async () => {
		const tc = getTestPage('techcrunch.html');
		const result = await ParseOGStream(tc);
		const ogImage =
		    'https://techcrunch.com/wp-content/uploads/2018/06/wwdc-2018-logo.jpg?w=585';
		expect(result).to.equal(ogImage);
	});

	it('should detect og image from techcrunch part 2', async () => {
		const result = await ParseOGStream(getTestPage('techcrunch_instagram.html'));
		const ogImage = 'https://techcrunch.com/wp-content/uploads/2018/06/instagram-algorithm.png?w=753';
		expect(result).to.equal(ogImage);
	});

	it('should not detect og image from broken techcrunch', async () => {
		const tc = getTestPage('techcrunch_broken.html');
		const result = await ParseOGStream(tc);
		expect(result).to.be.null;
	});
});
