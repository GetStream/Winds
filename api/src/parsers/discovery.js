import logger from '../utils/logger';
import rssFinder from 'rss-finder';
import FeedParser from 'feedparser';
import axios from 'axios';
import url from 'url';
import htmlparser from 'htmlparser2';
import got from 'got';

const rssTypes = [
	'application/rss+xml',
	'application/atom+xml',
	'application/rdf+xml',
	'application/rss',
	'application/atom',
	'application/rdf',
	'text/rss+xml',
	'text/atom+xml',
	'text/rdf+xml',
	'text/rss',
	'text/atom',
	'text/rdf',
];
const maxContentLengthBytes = 1024 * 1024 * 5;
const iconRels = ['icon', 'shortcut icon'];
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
				if (name === 'link' && rssTypes.indexOf(attr.type) !== -1) {
					feeds.push({
						title: attr.title || null,
						url: attr.href || null,
					});
				}

				if (
					name === 'link' &&
					(iconRels.indexOf(attr.rel) !== -1 || attr.type === 'image/x-icon')
				) {
					favicon = attr.href;
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

function cleanUrl(uri) {
	if (uri[uri.length - 1] === '/') {
		return uri.substr(0, uri.length - 1);
	}

	return uri;
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

	while (i--) {
		feedUrl = res.feedUrls[i];

		if (feedUrl.url) {
			if (!isRelativeUrl(feedUrl.url)) {
				feedUrl.url = url.resolve(uri, feedUrl.url);
			}
		} else {
			feedUrl.url = uri;
		}
	}

	if (!res.site.url) {
		res.site.url = cleanUrl(uri);
	}

	if (res.site.favicon) {
		if (!isRelativeUrl(res.site.favicon)) {
			res.site.favicon = url.resolve(res.site.url, res.site.favicon);
		}

		return res;
	} else {
		favicon = getFaviconUrl(res.site.url);

		try {
			let response = await got(favicon, {
				retries: 0,
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
