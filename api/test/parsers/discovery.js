import { expect } from 'chai';
import nock from 'nock';

import { discoverRSS } from '../../src/parsers/discovery';

const host = 'http://localhost';

describe('Discovery', () => {
    before(async () => {
        const mockPaths = [
            { path: '/html',      file: 'index.html',     type: 'text/html' },
            { path: '/html/',     file: 'index.html',     type: 'text/html' },
            { path: '/case/',     file: 'case.html',      type: 'text/html' },
            { path: '/rss',       file: 'rss.xml',        type: 'text/xml' },
            { path: '/nofavicon', file: 'nofavicon.html', type: 'text/html' },
            { path: '/nourl',     file: 'nourl.xml',      type: 'text/xml' },
            { path: '/fail',      file: 'fail.xml',       type: 'text/xml' },
        ];

        for (const { path, file, type } of mockPaths) {
            nock(host)
                .get(path)
                .replyWithFile(200, `${__dirname}/../data/discovery/${file}`, { 'Content-Type': type })
        }

        nock(host)
            .get(`${__dirname}/favicon.ico`)
            .reply(500)
    });

    after(() => nock.cleanAll());

	const testCases = [
		{
			title: 'html request',
			url: `${host}/html`,
			site: {
				title: 'RSSFinder',
				favicon: `${host}/favicon.ico`,
				url: `${host}/html`,
			},
			feedUrls: [{ title: 'RSS', url: `${host}/rssfinder.xml` }],
		},
		{
			title: 'html request 2',
			url: `${host}/html/`,
			site: {
				title: 'RSSFinder',
				favicon: `${host}/favicon.ico`,
				url: `${host}/html`,
			},
			feedUrls: [{ title: 'RSS', url: `${host}/rssfinder.xml` }],
		},
		{
			title: 'html request case',
			url: `${host}/case/`,
			site: {
				title: 'RSSFinder',
				favicon: `${host}/favicon.ico`,
				url: `${host}/case`,
			},
			feedUrls: [{ title: 'RSS', url: `${host}/rssfinder.xml` }],
		},
		{
			title: 'rss request cnn',
			url: `${host}/rss`,
			site: {
				title: 'CNN.com - RSS Channel - App International Edition',
				favicon: `https://www.cnn.com/favicon.ico`,
				url: `https://www.cnn.com/app-international-edition/index.html`,
			},
			feedUrls: [{ title: 'CNN.com - RSS Channel - App International Edition', url: `http://rss.cnn.com/rss/edition` }],
		},
		{
			title: 'no favicon',
			url: `${host}/nofavicon`,
			site: {
				title: 'RSSFinder',
				favicon: null,
				url: `${host}/nofavicon`,
			},
			feedUrls: [{ title: 'RSS', url: `${host}/rssfinder.xml` }],
		},
		{
			title: 'no url',
			url: `${host}/nourl`,
			site: {
				title: 'Index - 24óra',
				favicon: `http://index.hu/favicon.ico`,
				url: `http://index.hu/24ora/`,
			},
			feedUrls: [{ title: 'Index - 24óra', url: `${host}/nourl` }],
		},
	];

	for (let t of testCases) {
		it(`should extract info: ${t.title}`, async () => {
			const res = await discoverRSS(t.url);
			expect(res.site).to.deep.equal(t.site);
			expect(res.feedUrls).to.deep.equal(t.feedUrls);
		});
	}
});
