import strip from 'strip';
import sanitizeHtml from 'sanitize-html';
import entities from 'entities';
import moment from 'moment';
import normalize from 'normalize-url';
import FeedParser from 'feedparser';

import Podcast from '../models/podcast'; // eslint-disable-line
import Episode from '../models/episode';
import Article from '../models/article';
import RSS from '../models/rss';

import config from '../config'; // eslint-disable-line
import logger from '../utils/logger';
import { getStatsDClient } from '../utils/statsd';
import axios from 'axios';
import zlib from 'zlib';
import { createHash } from 'crypto';

const WindsUserAgent =
	'Winds: Open Source RSS & Podcast app: https://getstream.io/winds/';
const AcceptHeader = 'text/html,application/xhtml+xml,application/xml';
const statsd = getStatsDClient();

const maxContentLengthBytes = 1024 * 1024 * 5;

function sanitize(dirty) {
	return sanitizeHtml(dirty, {
		allowedAttributes: { img: ['src', 'title', 'alt'] },
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
}

export async function ParsePodcast(podcastUrl, limit = 1000) {
	logger.info(`Attempting to parse podcast ${podcastUrl}`);
	let t0 = new Date();
	let stream = await ReadFeedURL(podcastUrl);
	let posts = await ReadFeedStream(stream);
	let podcastResponse = ParsePodcastPosts(posts, limit);
	statsd.timing('winds.parsers.podcast.finished_parsing', new Date() - t0);
	return podcastResponse;
}

// ParseFeed parses the feedURL
export async function ParseFeed(feedURL, limit = 1000) {
	logger.info(`Attempting to parse RSS ${feedURL}`);
	// timers
	let t0 = new Date();
	let stream = await ReadFeedURL(feedURL);
	let posts = await ReadFeedStream(stream);
	let feedResponse = ParseFeedPosts(posts, limit);
	statsd.timing('winds.parsers.rss.finished_parsing', new Date() - t0);
	return feedResponse;
}

export function ComputeHash(post) {
	const enclosureUrls = post.enclosures.map(e => {
		e.url;
	});
	const enclosureString = enclosureUrls.join(',') || '';
	// ignore post.content for now, it changes too often I think
	const data = `${post.title}:${post.description}:${post.link}:${enclosureString}`;
	return createHash('md5')
		.update(data)
		.digest('hex');
}

export function ComputePublicationHash(posts) {
	let fingerprints = [];
	for (let p of posts.slice(0, 20)) {
		if (!p.fingerprint) {
			throw Error('missing fingerprint');
		}
		fingerprints.push(p.fingerprint);
	}
	const data = fingerprints.join(',');
	return createHash('md5')
		.update(data)
		.digest('hex');
}

export function CreateFingerPrints(posts) {
	if (!posts.length) {
		return posts;
	}
	// start by selecting the best strategy for uniqueness
	let uniqueness = { guid: {}, link: {}, enclosure: {}, hash: {} };
	for (let p of posts) {
		uniqueness.guid[p.guid && p.guid.slice(0, 1019)] = 1;
		uniqueness.link[p.link && p.link.slice(0, 1019)] = 1;
		if (p.enclosures.length && p.enclosures[0].url) {
			uniqueness.enclosure[p.enclosures[0].url] = 1;
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
	const l = posts.length;
	for (let s of ['guid', 'link', 'enclosure']) {
		if (uniquenessCounts[s] == l) {
			strategy = s;
			break;
		}
	}
	if (strategy == 'hash' && uniquenessCounts.guid >= 3) {
		// better to fail in a predictable way
		strategy = 'guid';
	}

	// compute the post fingerprints
	for (let p of posts) {
		p.fingerprint = `${strategy}:${p[strategy]}`;
	}

	// next compute the publication fingerprint
	let hash = ComputePublicationHash(posts);
	posts[0].meta = posts[0].meta || {};
	posts[0].meta.fingerprint = `${strategy}:${hash}`;
	posts[0].meta.fingerprintCounts = uniquenessCounts;

	return posts;
}

// Parse the posts and add our custom logic
export function ParsePodcastPosts(posts, limit = 1000) {
	let podcastContent = { episodes: [] };

	posts = CreateFingerPrints(posts);

	for (let i in posts.slice(0, limit)) {
		const post = posts[i];
		let url = post.link;
		if (!url) {
			url =
				post.enclosures && post.enclosures[0]
					? post.enclosures[0].url
					: post.guid;
		}
		url = normalize(url);
		if (!url) {
			logger.info('skipping episode since there is no url');
			continue;
		}
		const title = strip(post.title);
		if (!title) {
			logger.info('skipping episode since there is no title');
			continue;
		}
		let image = post.image && post.image.url;
		// ensure we keep order for feeds with no time
		const time =
			moment(post.pubdate).toISOString() ||
			moment()
				.subtract(i, 'minutes')
				.toISOString();
		let episode = new Episode({
			description: strip(post.description).substring(0, 280),
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

export async function ReadURL(url) {
	let headers = {
		'User-Agent': WindsUserAgent,
		Accept: AcceptHeader,
		'Accept-Encoding': 'gzip,deflate',
	};
	let response = await axios({
		method: 'get',
		url: url,
		responseType: 'stream',
		maxContentLength: maxContentLengthBytes,
		timeout: 12 * 1000,
		headers: headers,
		maxRedirects: 20,
	});
	let encoding = response.headers['content-encoding'];
	switch (encoding) {
		case 'gzip':
			response.data.pipe(zlib.createGunzip());
			break;
		case 'deflate':
			response.data.pipe(zlib.createDeflate());
			break;
		default:
			break;
	}
	return response;
}

function sleep(time) {
	return new Promise(resolve => time ? setTimeout(resolve, time) : resolve());
}

// Read the given feed URL and return a Stream
export async function ReadPageURL(url, retries = 3, backoffDelay = 20) {
	let currentDelay = 0, nextDelay = backoffDelay;
	for (;;) {
		try {
			await sleep(currentDelay);
			const response = await ReadURL(url);
			const contentType = response.headers['content-type'].toLowerCase();
			if (!contentType.includes('html')) {
				logger.warn(`Invalid content type ${contentType} for url ${url}`);
				return null;
			}

			return response.data;
		} catch (err) {
			logger.warn(`Failed to read feed url ${url}: ${err.message}. Retrying`);
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
			if (!retries) {
				throw err;
			}
		}
	}
}

// Read the given feed URL and return a Stream
export async function ReadFeedURL(feedURL, retries = 3, backoffDelay = 20) {
	let currentDelay = 0, nextDelay = backoffDelay;
	for (;;) {
		try {
			await sleep(currentDelay);
			const response = await ReadURL(feedURL);
			return response.data;
		} catch (err) {
			logger.warn(`Failed to read feed url ${feedURL}. Retrying`);
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
			if (!retries) {
				throw err;
			}
		}
	}
}

// Turn the feed Stream into a list of posts
export async function ReadFeedStream(feedStream) {
	let posts = [];
	var end = new Promise(function(resolve, reject) {
		feedStream
			.pipe(new FeedParser())
			.on('error', reject)
			.on('end', () => {
				resolve(posts);
			})
			.on('readable', function() {
				var stream = this,
					item;
				while ((item = stream.read())) {
					posts.push(item);
				}
			});
	});
	return end;
}

// Parse the posts and add our custom logic
export function ParseFeedPosts(posts, limit = 1000) {
	let feedContents = { articles: [] };
	// create finger prints before doing anything else
	posts = CreateFingerPrints(posts);

	for (let i in posts.slice(0, limit)) {
		const post = posts[i];

		let article;

		try {
			let description = strip(entities.decodeHTML(post.description)).substring(
				0,
				280,
			);
			if (description == 'null') {
				description = null;
			}
			const content = sanitize(post.summary);
			const url = normalize(post.link);
			if (!url) {
				logger.info('skipping article since there is no url');
				continue;
			}
			// articles need to have a title
			const title = strip(entities.decodeHTML(post.title));
			if (!title) {
				logger.info('skipping article since there is no title');
				continue;
			}
			// ensure we keep order for feeds with no time
			const time =
				moment(post.pubdate).toISOString() ||
				moment()
					.subtract(i, 'minutes')
					.toISOString();
			article = new Article({
				content: content,
				description: description,
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
