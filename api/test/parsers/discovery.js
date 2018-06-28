import { expect } from 'chai';

import http from 'http';
import pify from 'pify';
import getPort from 'get-port';

import { getTestFeed } from '../utils';
import { discoverRSS } from '../../src/parsers/discovery';
import fs from 'fs';

const host = 'localhost';

describe('start', async () => {
	it('your engines', () => {
		// no clue why, but mocha needs this here to work
	});
});

describe('Discovery', async () => {
	let server;
	let testCases = [];
	server = await createServer();
	testCases = getTestCases(server);

	function event(file, contentType) {
		return (req, res) => {
			const data = fs.readFileSync(`${__dirname}/${file}`);
			res.statusCode = 200;
			res.setHeader('Content-Type', contentType);
			res.write(data);
			res.end();
		};
	}

	server.on('/html', event('../data/discovery/index.html', 'text/html'));
	server.on('/html/', event('../data/discovery/index.html', 'text/html'));
	server.on('/rss', event('../data/discovery/rss.xml', 'text/xml'));
	server.on('/nofavicon', event('../data/discovery/nofavicon.html', 'text/html'));
	server.on('/nourl', event('../data/discovery/nourl.xml', 'text/xml'));

	server.on('/favicon.ico', (req, res) => {
		res.statusCode = 500;
		res.end();
	});

	server.on('/fail', event('./data/fail.xml', 'text/xml'));

	await server.listen(server.port);

	for (let t of testCases) {
		it(`discovery test case ${t.title}`, async () => {
			const res = await discoverRSS(t.url);
			expect(res.site).to.deep.equal(t.site);
			expect(res.feedUrls).to.deep.equal(t.feedUrls);
		});
	}
});

function getTestCases(server) {
	let testCases = [
		{
			title: 'html request',
			url: `${server.url}/html`,
			site: {
				title: 'RSSFinder',
				favicon: `${server.url}/favicon.ico`,
				url: `${server.url}/html`,
			},
			feedUrls: [{ title: 'RSS', url: `${server.url}/rssfinder.xml` }],
		},
		{
			title: 'html request 2',
			url: `${server.url}/html/`,
			site: {
				title: 'RSSFinder',
				favicon: `${server.url}/favicon.ico`,
				url: `${server.url}/html`,
			},
			feedUrls: [{ title: 'RSS', url: `${server.url}/rssfinder.xml` }],
		},
		{
			title: 'rss request kotaku',
			url: `${server.url}/rss`,
			site: {
				title: 'Kotaku',
				favicon: `http://kotaku.com/favicon.ico`,
				url: `http://kotaku.com`,
			},
			feedUrls: [{ title: 'Kotaku', url: `${server.url}/rss` }],
		},
		{
			title: 'no favicon',
			url: `${server.url}/nofavicon`,
			site: {
				title: 'RSSFinder',
				favicon: null,
				url: `${server.url}/nofavicon`,
			},
			feedUrls: [{ title: 'RSS', url: `${server.url}/rssfinder.xml` }],
		},
		{
			title: 'no url',
			url: `${server.url}/nourl`,
			site: {
				title: 'Index - 24óra',
				favicon: `http://index.hu/favicon.ico`,
				url: `http://index.hu/24ora/`,
			},
			feedUrls: [{ title: 'Index - 24óra', url: `${server.url}/nourl` }],
		},
	];

	return testCases;
}

// based on https://github.com/ggkovacs/rss-finder
function createServer() {
	return getPort().then(function(port) {
		var s = http.createServer(function(req, resp) {
			s.emit(req.url, req, resp);
		});

		s.host = host;
		s.port = port;
		s.url = 'http://' + host + ':' + port;
		s.protocol = 'http';

		s.listen = pify(s.listen, Promise);
		s.close = pify(s.close, Promise);

		return s;
	});
}
