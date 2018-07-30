import rssFinder from 'rss-finder';
import FeedParser from 'feedparser';
import axios from 'axios';
import url from 'url';
import normalize from 'normalize-url';
import htmlparser from 'htmlparser2';
import got from 'got';

import logger from '../utils/logger';
import { extractHostname } from '../utils/urls';

/*
* Based on the awesome work of rssfinder
* https://github.com/ggkovacs/rss-finder
* By @ggkovacs
*/

const rssMap = {
	'application/rss+xml': 1,
	'application/atom+xml': 1,
	'application/rdf+xml': 1,
	'application/rss': 1,
	'application/atom': 1,
	'application/rdf': 1,
	'text/rss+xml': 1,
	'text/atom+xml': 1,
	'text/rdf+xml': 1,
	'text/rss': 1,
	'text/atom': 1,
	'text/rdf': 1,
};
const iconRels = { icon: 1, 'shortcut icon': 1 };

// request settings
const maxContentLengthBytes = 1024 * 1024 * 5;
const WindsUserAgent = 'Winds: Open Source RSS & Podcast app: https://getstream.io/winds/';

// small wrapper around rssFinder that helps out with some common sites
export async function discoverRSSOld(url) {
	let foundRSS = await rssFinder(url);

	return foundRSS;
}

export async function discoverRSS(uri) {
	const headers = { 'User-Agent': WindsUserAgent };
	const response = await axios.get(uri, {
		headers,
		maxRedirects: 20,
		timeout: 12 * 1000,
		maxContentLength: maxContentLengthBytes,
	});

	let discovered;
	try {
		discovered = await discoverFromFeed(response.data);
	} catch (e) {
		discovered = discoverFromHTML(response.data);
	}

	const canonicalUrl = url.resolve(extractHostname(response.request), response.request.path);
	return fixData(discovered, canonicalUrl);
}

export function discoverFromHTML(body) {
	let rs = {};
	let feeds = [];
	let parser;
	let isFeeds;
	let favicon;
	let isSiteTitle;
	let siteTitle;
	let feedParser;

	parser = new htmlparser.Parser(
		{
			onopentag: function(name, attr) {
				if (name === 'link' && attr.type && attr.type.toLowerCase() in rssMap) {
					feeds.push({
						title: attr.title || null,
						url: attr.href || null,
					});
				}

				if (name === 'link') {
					let a = attr.rel && attr.rel.toLowerCase();
					let t = attr.type && attr.type.toLowerCase();

					if (a in iconRels || t === 'image/x-icon') {
						favicon = attr.href;
					}
				}

				if (name === 'title') {
					isSiteTitle = true;
				}
			},
			ontext: function(text) {
				if (isSiteTitle) {
					siteTitle = text;
				}
			},
			onclosetag: function(name) {
				if (name === 'title') {
					isSiteTitle = false;
				}
			},
		},
		{
			recognizeCDATA: true,
		},
	);

	parser.write(body);
	parser.end();
	rs.site = {
		title: siteTitle || null,
		favicon: favicon || null,
	};

	rs.feedUrls = feeds;

	return rs;
}

function isRelativeUrl(str) {
	return /^https?:\/\//i.test(str);
}

function getFaviconUrl(uri) {
	let parsedUrl = url.parse(uri);

	return url.resolve(parsedUrl.protocol + '//' + parsedUrl.host, 'favicon.ico');
}

// make the urls absolute and try the default favicon location
async function fixData(res, uri) {
	let feedUrl;
	let favicon;
	let i = res.feedUrls.length;
	// make the urls unique
	for (const feed of res.feedUrls) {
		if (feed.url) {
			if (!isRelativeUrl(feed.url)) {
				feed.url = normalize(url.resolve(uri, feed.url));
			}
		} else {
			feed.url = normalize(uri);
		}
	}

	if (!res.site.url) {
		res.site.url = normalize(uri);
	}

	if (res.site.favicon) {
		if (!isRelativeUrl(res.site.favicon)) {
			res.site.favicon = url.resolve(res.site.url, res.site.favicon);
		}

		return res;
	}

	// see if mysite.com/favicon.ico works :)
	favicon = getFaviconUrl(res.site.url);

	try {
		const headers = {
			'User-Agent': WindsUserAgent,
			'accept-encoding': 'gzip, deflate, br',
		};

		//XXX: ensure favicon url is reachable
		await axios.get(favicon, {
			headers,
			maxRedirects: 20,
			timeout: 12 * 1000,
			maxContentLength: maxContentLengthBytes,
		});
		res.site.favicon = favicon;
	} catch (_) {
		//XXX: ignore error
	}
	return res;
}

export function discoverFromFeed(body) {
	return new Promise(function(resolve, reject) {
		const feedParser = new FeedParser();

		feedParser.on('error', function(err) {
			reject(err);
		});

		let feedMeta;
		feedParser.on('readable', function() {
			if (!feedMeta) {
				feedMeta = this.meta;
			}
		});

		feedParser.write(body);

		feedParser.end(function() {
			if (feedMeta) {
				return resolve({
					site: {
						title: feedMeta.title || null,
						favicon: feedMeta.favicon || null,
						url: feedMeta.link || null,
					},
					feedUrls: [{
						title: feedMeta.title || null,
						url: feedMeta.xmlUrl || null,
					}]
				});
			}

			resolve({});
		});
	});
}
