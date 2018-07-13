import logger from '../utils/logger';
import rssFinder from 'rss-finder';
import FeedParser from 'feedparser';
import axios from 'axios';
import url from 'url';
import normalize from 'normalize-url';
import htmlparser from 'htmlparser2';
import got from 'got';

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
const WindsUserAgent =
	'Winds: Open Source RSS & Podcast app: https://getstream.io/winds/';

// small wrapper around rssFinder that helps out with some common sites
export async function discoverRSSOld(url) {
	let foundRSS = await rssFinder(url);

	return foundRSS;
}
export async function discoverRSS(url) {
	let headers = {
		'User-Agent': WindsUserAgent,
	};
	// timeout and max content length
	let response = await axios({
		method: 'get',
		url: url,
		maxContentLength: maxContentLengthBytes,
		timeout: 12 * 1000,
		headers: headers,
		maxRedirects: 20,
	});
	let discovered;
	try {
		discovered = await discoverFromFeed(response.data);
	} catch (e) {
		discovered = discoverFromHTML(response.data);
	}
	const canonicalUrl = response.request.res.responseUrl;
	let cleaned = fixData(discovered, canonicalUrl);
	return cleaned;
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
	} else {
		// see if mysite.com/favicon.ico works :)
		favicon = getFaviconUrl(res.site.url);

		try {
			let headers = {
				'User-Agent': WindsUserAgent,
				'accept-encoding': 'gzip, deflate, br',
			};
			let response = await axios({
				method: 'get',
				url: favicon,
				maxContentLength: maxContentLengthBytes,
				timeout: 12 * 1000,
				maxRedirects: 20,
				headers,
			});
			res.site.favicon = favicon;
			return res;
		} catch (e) {
			return res;
		}
	}
}

export function discoverFromFeed(body) {
	let end = new Promise(function(resolve, reject) {
		let rs = {};
		const feedParser = new FeedParser();

		const feeds = [];

		feedParser.on('error', function(err) {
			reject(err);
		});

		feedParser.on('readable', function() {
			let data;

			if (feeds.length === 0) {
				data = this.meta;
				feeds.push(data);
			}
		});

		feedParser.write(body);

		feedParser.end(function() {
			if (feeds.length !== 0) {
				rs.site = {
					title: feeds[0].title || null,
					favicon: feeds[0].favicon || null,
					url: feeds[0].link || null,
				};

				rs.feedUrls = [
					{
						title: feeds[0].title || null,
						url: feeds[0].xmlUrl || null,
					},
				];
			}

			resolve(rs);
		});
	});
	return end;
}
