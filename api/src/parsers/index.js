import strip from 'strip';
import sanitizeHtml from 'sanitize-html';
import entities from 'entities';
import moment from 'moment';
import request from 'request';
import normalize from 'normalize-url';
import FeedParser from 'feedparser';
import podcastParser from './podcast_parser_sax';

import Podcast from "../models/podcast" // eslint-disable-line
import Episode from '../models/episode';

import config from "../config" // eslint-disable-line
import logger from '../utils/logger';
import { getStatsDClient } from '../utils/statsd';

const WindsUserAgent = 'Winds: Open Source RSS & Podcast app: https://getstream.io/winds/';
const AcceptHeader = 'text/html,application/xhtml+xml,application/xml';
const statsd = getStatsDClient();


// sanitize cleans the html before returning it to the frontend
var sanitize = function(dirty) {
	return sanitizeHtml(dirty, {
		allowedAttributes: {
			img: ['src', 'title', 'alt'],
		},
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
};

function doRequest(url, options) {
	return new Promise(function (resolve, reject) {
		let headers = {
			'User-Agent':WindsUserAgent,
			'Accept': AcceptHeader,
		};
		request(Object.assign(options, {url, headers}), function (error, res, body) {
			if (!error) {
				resolve([res, body]);
			} else {
				reject(error);
			}
		});
	});
}

async function ParseFeed(feedUrl) {
	let t0 = new Date();
	let feedContents = { articles: [] };
	let response, body;

	try {
		[response, body] = await doRequest(feedUrl, {
			pool: false,
			timeout: 6000,
			gzip: true,
		});
	} catch(err) {
		logger.warn({err});
		return;
	}

	if (response.statusCode !== 200) {
		logger.warn(`${feedUrl} returned status code ${response.statusCode}, skipping`);
	}

	let t1 = new Date();
	statsd.timing('winds.parsers.feed.transfer', (new Date() - t0));

	let feedParser = new FeedParser();

	feedParser.on('readable', () => {
		let postBuffer;
		while ((postBuffer = feedParser.read())) {
			let post = Object.assign({}, postBuffer);

			let description = strip(entities.decodeHTML(post.description)).substring(0, 280);

			let parsedArticle = {
				content: sanitize(post.summary),
				description: description,
				enclosures: post.enclosures,
				publicationDate:
				moment(post.pubdate).toISOString() ||
				moment()
					.subtract(feedContents.articles.length, 'minutes') // feedContents.articles only gets pushed to every time we parse an article, so it serves as a reasonable offset.
					.toISOString(),
				title: strip(entities.decodeHTML(post.title)),
				url: normalize(post.link),
			};

			// HNEWS
			if (post.comments) {
				parsedArticle.commentUrl = post.comments;
			}

			// product hunt comments url
			if (post.link.indexOf('https://www.producthunt.com') === 0) {
				let matches = post.description.match(/(https:\/\/www.producthunt.com\/posts\/.*)"/);
				if (matches.length) {
					parsedArticle.commentUrl = matches[1];
				}
			}

			// nice images for XKCD
			if (post.link.indexOf('https://xkcd') === 0) {
				let matches = post.description.match(/(https:\/\/imgs.xkcd.com\/comics\/.*?)"/);
				if (matches.length) {
					parsedArticle.images = { og: matches[1] };
				}
			}

			feedContents.articles.push(parsedArticle);
			feedContents.title = post.meta.title;
			feedContents.link = post.meta.link;
			feedContents.image = post.meta.image;
		}
	});

	feedParser.stream.write(body);
	statsd.timing('winds.parsers.feed.finished_parsing', (new Date() - t1));
	return feedContents;
}

function ParsePodcast(podcastUrl, callback) {
	logger.info(`Attempting to parse podcast ${podcastUrl}`);
	let opts = {
		headers: {
			'Accept': AcceptHeader,
			'User-Agent': WindsUserAgent,
		},
		pool: false,
		timeout: 10000,
		url: podcastUrl,
	};

	let podcastContents = { episodes: [] };

	request(opts, (error, response, responseData) => {
		// easy way to detect charset or encoding issues
		// let partialBody = response.body.substring(0,500)
		//logger.debug(`${podcastUrl} response \n${partialBody}`)
		podcastParser(responseData, (err, data) => {
			if (err) {
				return callback(err, null);
			}

			// the podcast metadata we care about:
			podcastContents.title = data.title;
			podcastContents.link = data.link;
			podcastContents.image = data.image;
			podcastContents.description = data.description ? data.description.long : '';

			let episodes = data.episodes ? data.episodes : data;

			episodes.map(episode => {
				try {
					let url = episode.link;
					if (!url) {
						url = episode.enclosure ? episode.enclosure.url : episode.guid;
					}
					var parsedEpisode = new Episode({
						description: strip(episode.description).substring(0, 280),
						duration: episode.duration,
						enclosure: episode.enclosure && episode.enclosure.url,
						images: { og: episode.image },
						link: episode.link,
						publicationDate:
						moment(episode.published).toISOString() ||
						moment()
							.subtract(podcastContents.episodes.length, 'minutes')
							.toISOString(),
						title: strip(episode.title),
						url: normalize(url),
					});
				} catch (e) {
					logger.error('Failed to parse episode', e);
				}
				podcastContents.episodes.push(parsedEpisode);
			});
			callback(null, podcastContents);
		});
	});
}

exports.ParseFeed = ParseFeed;
exports.ParsePodcast = ParsePodcast;
