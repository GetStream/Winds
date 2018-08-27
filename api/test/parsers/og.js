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
		expect(result).to.not.have.property('image');
	});

	it('should detect og image from techcrunch', async () => {
		const tc = getTestPage('techcrunch.html');
		const result = await ParseOGStream(tc);
		const ogImage =
			'https://techcrunch.com/wp-content/uploads/2018/06/wwdc-2018-logo.jpg?w=585';
		expect(result).to.have.property('image', ogImage);
	});

	it('should detect og image from techcrunch part 2', async () => {
		const result = await ParseOGStream(getTestPage('techcrunch_instagram.html'));
		const ogImage =
			'https://techcrunch.com/wp-content/uploads/2018/06/instagram-algorithm.png?w=753';
		expect(result).to.have.property('image', ogImage);
	});

	it('kotaku', async () => {
		const result = await ParseOGStream(getTestPage('kotaku.html'));
		const ogImage =
			'https://i.kinja-img.com/gawker-media/image/upload/s--G9Y4stcm--/c_fill,fl_progressive,g_center,h_900,q_80,w_1600/jhvo3paz6ikemi81uklc.bmp';
		expect(result).to.have.property('image', ogImage);
	});

	it('should not detect og image from broken techcrunch', async () => {
		const tc = getTestPage('techcrunch_broken.html');
		const result = await ParseOGStream(tc);
		expect(result).to.not.have.property('image');
	});
});
