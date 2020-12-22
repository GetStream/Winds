import request from 'request';
import entities from 'entities';
import moment from 'moment';
import normalize from 'normalize-url';
import sanitizeHtml from 'sanitize-html';
import strip from 'strip';
import zlib from 'zlib';
import * as urlParser from 'url';
import FeedParser from 'feedparser';
import InflateAuto from 'inflate-auto';
import { createHash } from 'crypto';
import { PassThrough } from 'stream';
import { Gunzip } from 'zlib';

import Podcast from '../models/podcast'; // eslint-disable-line
import Episode from '../models/episode';
import Article from '../models/article';
import RSS from '../models/rss';

import config from '../config'; // eslint-disable-line
import logger from '../utils/logger';
import { getStatsDClient } from '../utils/statsd';

const WindsUserAgent =
	'Winds: Open Source RSS & Podcast app: https://getstream.io/winds/';
const AcceptHeader = 'text/html,application/xhtml+xml,application/xml';
const statsd = getStatsDClient();

const requestTTL = 12 * 1000;
const maxContentLengthBytes = 1024 * 1024 * 5;

function sanitize(dirty) {
	return sanitizeHtml(dirty, {
		allowedAttributes: { img: ['src', 'title', 'alt'] },
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
}

export async function ParsePodcast(podcastUrl, guidStability, limit = 1000) {
	logger.info(`Attempting to parse podcast ${podcastUrl}`);
	const start = new Date();
	const host = urlParser.parse(podcastUrl).host;

	const stream = await ReadFeedURL(podcastUrl);
	const posts = await ReadFeedStream(stream);
	const podcastResponse = ParsePodcastPosts(host, posts, guidStability, limit);

	statsd.timing('winds.parsers.podcast.finished_parsing', new Date() - start);
	return podcastResponse;
}

export async function ParseFeed(feedURL, guidStability, limit = 1000) {
	logger.info(`Attempting to parse RSS ${feedURL}`);
	const start = new Date();
	const host = urlParser.parse(feedURL).host;

	const stream = await ReadFeedURL(feedURL);
	const posts = await ReadFeedStream(stream);
	const feedResponse = ParseFeedPosts(host, posts, guidStability, limit);

	statsd.timing('winds.parsers.rss.finished_parsing', new Date() - start);
	return feedResponse;
}

export function ComputeHash(post) {
	const enclosureUrls = post.enclosures.map((e) => e.url);
	const enclosureString = enclosureUrls.join(',') || '';
	//XXX: ignore post.content for now, it changes too often
	const data = `${post.title}:${post.description}:${post.link}:${enclosureString}`;
	return createHash('md5').update(data).digest('hex');
}

export function ComputePublicationHash(posts, limit = 20) {
	const fingerprints = posts
		.slice(0, limit)
		.filter((p) => !!p.fingerprint)
		.map((p) => p.fingerprint);
	if (fingerprints.length != Math.min(posts.length, limit)) {
		throw Error('Missing post fingerprints');
	}
	const data = fingerprints.join(',');
	return createHash('md5').update(data).digest('hex');
}

export function CreateFingerPrints(posts, guidStability) {
	if (!posts.length) {
		return posts;
	}
	// start by selecting the best strategy for uniqueness
	let uniqueness = { guid: {}, link: {}, enclosure: {}, hash: {} };
	for (let p of posts) {
		uniqueness.guid[p.guid && p.guid.slice(0, 249)] = 1;
		uniqueness.link[p.link && p.link.slice(0, 249)] = 1;
		if (p.enclosures.length && p.enclosures[0].url) {
			uniqueness.enclosure[p.enclosures[0].url.slice(0, 244)] = 1;
			p.enclosure = p.enclosures[0].url;
		}
		p.hash = ComputeHash(p);
		uniqueness.hash[p.hash] = 1;
	}
	// count which strategy is the best
	let uniquenessCounts = {};
	for (const [k, v] of Object.entries(uniqueness)) {
		uniquenessCounts[k] = Object.keys(v).length;
	}
	// select the strategy that's 100% unique, if none match fall back to a hash
	let strategy = 'hash';
	const backupStrategy = guidStability === 'STABLE' ? 'guid' : 'link';
	const l = posts.length;
	const strategies = ['guid', 'link', 'enclosure'];
	if (guidStability !== 'STABLE') {
		strategies.shift();
	}
	for (let s of strategies) {
		if (uniquenessCounts[s] == l) {
			strategy = s;
			break;
		}
	}
	if (strategy == 'hash' && uniquenessCounts[backupStrategy] >= 3) {
		// better to fail in a predictable way
		strategy = backupStrategy;
	}

	// compute the post fingerprints
	for (let p of posts) {
		p.fingerprint = `${strategy}:${
			p[strategy] && p[strategy].slice(0, 254 - strategy.length)
		}`;
	}

	// next compute the publication fingerprint
	let hash = ComputePublicationHash(posts);
	posts[0].meta = posts[0].meta || {};
	posts[0].meta.fingerprint = `${strategy}:${hash}`;
	posts[0].meta.fingerprintCounts = uniquenessCounts;

	return posts;
}

// Parse the posts and add our custom logic
export function ParsePodcastPosts(domain, posts, guidStability, limit = 1000) {
	let podcastContent = { episodes: [] };

	posts = CreateFingerPrints(posts, guidStability);

	for (let i in posts.slice(0, limit)) {
		const post = posts[i];
		let url = post.link;
		if (!url) {
			url =
				post.enclosures && post.enclosures[0]
					? post.enclosures[0].url
					: post.guid;
		}
		if (!url) {
			logger.info('skipping episode since there is no url');
			continue;
		}
		const title = strip(post.title);
		if (!title) {
			logger.info('skipping episode since there is no title');
			continue;
		}
		if (!urlParser.parse(url).host) {
			url = url.resolve(domain, url);
		}
		url = normalize(url);
		let image = post.image && post.image.url;
		// ensure we keep order for feeds with no time
		const time =
			moment(post.pubdate).toISOString() ||
			moment().subtract(i, 'minutes').toISOString();
		let episode = new Episode({
			description: (strip(post.description) || '').substring(0, 240),
			duration: post.duration,
			guid: post.guid,
			link: post.link,
			enclosures: post.enclosures,
			fingerprint: post.fingerprint,
			enclosure: post.enclosures && post.enclosures[0] && post.enclosures[0].url,
			images: { og: image },
			publicationDate: time,
			title: strip(post.title),
			url: url,
		});
		podcastContent.episodes.push(episode);
	}

	if (posts.length) {
		podcastContent.title = posts[0].meta.title;
		podcastContent.link = posts[0].meta.link;
		podcastContent.image = posts[0].meta.image && posts[0].meta.image.url;
		podcastContent.description = posts[0].meta.description;
		podcastContent.fingerprint = posts[0].meta.fingerprint;
	}
	return podcastContent;
}

export function ReadURL(url) {
	let headers = {
		'User-Agent': WindsUserAgent,
		'Accept-Encoding': 'gzip,deflate',
		Accept: AcceptHeader,
	};
	return request({
		method: 'get',
		agent: false,
		pool: { maxSockets: 256 },
		uri: url,
		timeout: requestTTL,
		headers: headers,
		maxRedirects: 20,
		resolveWithFullResponse: true,
	});
}

function sleep(time) {
	if (time <= 0) {
		return Promise.resolve();
	}
	return new Promise((resolve) => setTimeout(resolve, time));
}

function checkHeaders(stream, url, checkContenType = false) {
	return new Promise((resolve, reject) => {
		let resolved = false;
		let bodyLength = 0;

		//XXX: piping to a pass through dummy stream so we can pipe it later
		//     without causing request errors
		let dummy = new PassThrough();
		stream.pipe(dummy);

		stream
			.on('response', (response) => {
				if (checkContenType) {
					const contentType = response.headers['content-type'];
					if (
						!contentType ||
						!contentType.trim().toLowerCase().includes('html')
					) {
						logger.warn(
							`Invalid content type '${contentType}' for url ${url}`,
						);
						stream.abort();
						return resolve(null);
					}
				}
				const contentLength = parseInt(response.headers['content-length'], 10);
				if (contentLength > maxContentLengthBytes) {
					stream.abort();
					return reject(
						new Error('Request body larger than maxBodyLength limit'),
					);
				}
				const encoding = response.headers['content-encoding'] || 'identity';
				let inflater;
				switch (encoding.trim().toLowerCase()) {
					case 'deflate':
						inflater = new InflateAuto();
						break;
					case 'gzip':
						inflater = new Gunzip();
						break;
				}
				if (inflater) {
					dummy = dummy.pipe(inflater);
				}
				dummy.on('error', (err) => {
					if (!resolved) {
						reject(err);
					}
					stream.abort();
				});
			})
			.on('error', (err) => {
				if (!resolved) {
					reject(err);
				} else {
					dummy.destroy(err);
				}
				stream.abort();
			})
			.on('data', (data) => {
				resolved = true;
				resolve(dummy);

				if (bodyLength + data.length <= maxContentLengthBytes) {
					bodyLength += data.length;
				} else {
					dummy.destroy(
						new Error('Request body larger than maxBodyLength limit'),
					);
				}
			})
			.on('end', () => {
				if (!resolved) {
					resolve(dummy);
				}
			});
	});
}

// Read the given feed URL and return a Stream
export async function ReadPageURL(url, retries = 2, backoffDelay = 100) {
	let currentDelay = 0,
		nextDelay = backoffDelay;
	for (;;) {
		try {
			await sleep(currentDelay);
			return await checkHeaders(ReadURL(url), url, true);
		} catch (err) {
			logger.warn(`Failed to read page url ${url}: ${err.message}. Retrying`);
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
			if (!retries) {
				throw err;
			}
		}
	}
}

// Read the given feed URL and return a Stream
export async function ReadFeedURL(feedURL, retries = 2, backoffDelay = 100) {
	let currentDelay = 0,
		nextDelay = backoffDelay;
	for (;;) {
		try {
			await sleep(currentDelay);
			return await checkHeaders(ReadURL(feedURL), feedURL);
		} catch (err) {
			logger.warn(`Failed to read feed url ${feedURL}: ${err.message}. Retrying`);
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
			if (!retries) {
				throw err;
			}
		}
	}
}

// Turn the feed Stream into a list of posts
export function ReadFeedStream(feedStream) {
	return Promise.race([
		new Promise((resolve, reject) =>
			setTimeout(reject, 2 * requestTTL, new Error('Request timed out')),
		),
		new Promise((resolve, reject) => {
			const posts = [];
			const parser = new FeedParser();
			let resolved = false;

			feedStream.on('error', (err) => {
				if (!resolved) {
					reject(err);
				}
				feedStream.destroy();
			});

			parser
				.on('data', (data) => posts.push(data))
				.on('end', () => {
					resolved = true;
					resolve(posts);
				})
				.on('error', (err) => {
					if (!resolved) {
						reject(err);
					}
					parser.destroy();
				});

			feedStream.pipe(parser);
		}),
	]);
}

// Parse the posts and add our custom logic
export function ParseFeedPosts(domain, posts, guidStability, limit = 1000) {
	let feedContents = { articles: [] };
	// create finger prints before doing anything else
	posts = CreateFingerPrints(posts, guidStability);

	for (let i in posts.slice(0, limit)) {
		const post = posts[i];

		let article;
		let url = post.link;

		try {
			if (!url) {
				logger.info('skipping article since there is no url');
				continue;
			}
			const title = strip(entities.decodeHTML(post.title));
			if (!title) {
				logger.info('skipping article since there is no title');
				continue;
			}
			let description = strip(entities.decodeHTML(post.description)).substring(
				0,
				280,
			);
			if (description == 'null') {
				description = null;
			}
			if (!urlParser.parse(url).host) {
				url = url.resolve(domain, url);
			}
			url = normalize(url);
			// articles need to have a title
			// ensure we keep order for feeds with no time
			const time =
				moment(post.pubdate).toISOString() ||
				moment().subtract(i, 'minutes').toISOString();
			const content = sanitize(post.summary);
			article = new Article({
				content: content,
				description: (description || '').substring(0, 240),
				enclosures: post.enclosures,
				fingerprint: post.fingerprint,
				guid: post.guid,
				link: post.link,
				publicationDate: time,
				title: title,
				url: url,
			});
		} catch (err) {
			logger.info('skipping article', { err });
			continue;
		}

		if (post['yt:videoid']) {
			let youtubeID = post['yt:videoid']['#'];
			article.enclosures.push({
				type: 'youtube',
				url: `https://www.youtube.com/watch?v=${youtubeID}`,
			});
			if (post['media:group'] && !article.description) {
				article.description = post['media:group']['media:description']['#'];
			}
		}

		// HNEWS
		if (post.comments) {
			article.commentUrl = post.comments;
		}

		if (post.link) {
			// product hunt comments url
			if (post.link.startsWith('https://www.producthunt.com')) {
				const matches = post.description.match(
					/(https:\/\/www.producthunt.com\/posts\/.*)"/,
				);
				if (matches && matches.length) {
					article.commentUrl = matches[1];
				}
			}

			// nice images for XKCD
			if (post.link.startsWith('https://xkcd')) {
				const matches = post.description.match(
					/(https:\/\/imgs.xkcd.com\/comics\/.*?)"/,
				);
				if (matches && matches.length) {
					article.images = { og: matches[1] };
				}
			}
		}

		feedContents.articles.push(article);
	}
	if (posts.length) {
		let meta = posts[0].meta;
		feedContents.title = meta.title;
		feedContents.link = meta.link;
		feedContents.image = meta.image;
		feedContents.description = meta.description;
		feedContents.fingerprint = meta.fingerprint;

		if (meta.link && meta.link.includes('reddit.com')) {
			feedContents.title = `/r/${feedContents.title}`;
		}
	}
	return feedContents;
}

export function checkGuidStability(original, control) {
	const link2guid = original.reduce(
		(map, content) => map.set(content.link, content.guid),
		new Map(),
	);
	let same = true;
	for (const content of control) {
		const originalGUID = link2guid.get(content.link);
		if (originalGUID) {
			same = same && originalGUID == content.guid;
		}
	}
	return same ? 'STABLE' : 'UNSTABLE';
}
