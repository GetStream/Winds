import strip from 'strip';
import sanitizeHtml from 'sanitize-html';
import entities from 'entities';
import moment from 'moment';
import normalize from 'normalize-url';
import FeedParser from 'feedparser';

import Podcast from '../models/podcast'; // eslint-disable-line
import Episode from '../models/episode';

import config from '../config'; // eslint-disable-line
import logger from '../utils/logger';
import { getStatsDClient } from '../utils/statsd';
import axios from 'axios';
import zlib from 'zlib';

const WindsUserAgent =
	'Winds: Open Source RSS & Podcast app: https://getstream.io/winds/';
const AcceptHeader = 'text/html,application/xhtml+xml,application/xml';
const statsd = getStatsDClient();

const maxContentLengthBytes = 1024 * 1024 * 5;


export async function ParsePodcast(podcastUrl, limit=1000) {
	logger.info(`Attempting to parse podcast ${podcastUrl}`);
	let t0 = new Date();
	let stream = await ReadFeedURL(podcastUrl);
	let posts = await ReadFeedStream(stream);
	let podcastResponse = ParsePodcastPosts(posts, limit);
	statsd.timing('winds.parsers.podcast.finished_parsing', new Date() - t0);
	return podcastResponse;
}

// ParseFeed parses the feedURL
export async function ParseFeed(feedURL) {
	logger.info(`Attempting to parse RSS ${feedURL}`);
	// timers
	let t0 = new Date();
	let stream = await ReadFeedURL(feedURL);
	let posts = await ReadFeedStream(stream);
	let feedResponse = ParseFeedPosts(posts);
	statsd.timing('winds.parsers.rss.finished_parsing', new Date() - t0);
	return feedResponse;
}

// Parse the posts and add our custom logic
export function ParsePodcastPosts(posts, limit=1000) {
	let podcastContent = { episodes: [] };
	let i = 0;

	for (let post of posts.slice(0, limit)) {
		i++;
		let url = post.link;
		if (!url) {
			url = post.enclosures && post.enclosures[0] ? post.enclosures[0].url : post.guid;
		}
		let image = post.image && post.image.url;
		let episode = new Episode({
			description: strip(post.description).substring(0, 280),
			duration: post.duration,
			enclosure: post.enclosures && post.enclosures[0] && post.enclosures[0].url,
			images: { og: image },
			link: post.link,
			publicationDate:
				moment(post.pubdate).toISOString() ||
				moment()
					.subtract(i, 'minutes') // ensure we keep order for feeds with no time
					.toISOString(),
			title: strip(post.title),
			url: normalize(url),
		});
		podcastContent.episodes.push(episode);
	}

	if (posts.length) {
		podcastContent.title = posts[0].meta.title;
		podcastContent.link = posts[0].meta.link;
		podcastContent.image = posts[0].meta.image && posts[0].meta.image.url;
		podcastContent.description = posts[0].meta.description;
	}
	return podcastContent;
}

export async function ReadURL(url) {
	let headers = {
		'User-Agent': WindsUserAgent,
		'Accept': AcceptHeader,
		'Accept-Encoding': 'gzip,deflate',
	};
	let response = await axios({
		method: 'get',
		url: url,
		responseType: 'stream',
		maxContentLength: maxContentLengthBytes,
		timeout: 6000,
		headers: headers,
		maxRedirects: 20,
	});
	let encoding = response.headers['content-encoding']
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

// Read the given feed URL and return a Stream
export async function ReadPageURL(url) {
	let response = await ReadURL(url)

	let headers = response.headers;
	let contentType = headers['content-type'].toLowerCase();
	if (contentType.indexOf('html') === -1) {
		logger.warn(`Doesn't look like anything to me... ${contentType} for url ${url}`);
		return false;
	}

	return response.data;
}

// Read the given feed URL and return a Stream
export async function ReadFeedURL(feedURL) {
	let response = await ReadURL(feedURL)

	return response.data;
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
export function ParseFeedPosts(posts) {
	let feedContents = { articles: [] };
	let i = 0;

	for (let post of posts.slice(0, 1)) {
		i++;

		let article;

		try {
			let description = strip(entities.decodeHTML(post.description)).substring(
				0,
				280,
			);
			article = {
				content: sanitize(post.summary),
				description: description,
				enclosures: post.enclosures,
				publicationDate:
					moment(post.pubdate).toISOString() ||
					moment()
						.subtract(i, 'minutes') // ensure we keep order for feeds with no time
						.toISOString(),
				title: strip(entities.decodeHTML(post.title)),
				url: normalize(post.link),
			};
		} catch (err) {
			logger.info('skipping article', { err });
			continue;
		}

		if (post['yt:videoid']) {
			let youtubeID = post['yt:videoid']['#']
			article.enclosures.push({type: 'youtube', url: `https://www.youtube.com/watch?v=${youtubeID}`})
		}

		// HNEWS
		if (post.comments) {
			article.commentUrl = post.comments;
		}

		if (post.link) {
			// product hunt comments url
			if (post.link.indexOf('https://www.producthunt.com') === 0) {
				let matches = post.description.match(
					/(https:\/\/www.producthunt.com\/posts\/.*)"/,
				);
				if (matches && matches.length) {
					article.commentUrl = matches[1];
				}
			}

			// nice images for XKCD
			if (post.link.indexOf('https://xkcd') === 0) {
				let matches = post.description.match(
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
		let meta = posts[0].meta
		feedContents.title = meta.title;
		feedContents.link = meta.link;
		feedContents.image = meta.image;
		feedContents.description = meta.description;
		if (meta.link) {
			if (meta.link.indexOf("reddit.com") != -1) {
				feedContents.title = `/r/${feedContents.title}`
			}
		}

	}
	return feedContents;
}

// sanitize cleans the html before returning it to the frontend
var sanitize = function(dirty) {
	return sanitizeHtml(dirty, {
		allowedAttributes: {
			img: ['src', 'title', 'alt'],
		},
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
};
