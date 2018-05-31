import events from '../utils/events';
import async from 'async';
import isUrl from 'url-regex';
import opmlParser from 'node-opml-parser';
import opmlGenerator from 'opml-generator';
import moment from 'moment';
import entities from 'entities';
import normalizeUrl from 'normalize-url';
import stream from 'getstream';
import search from '../utils/search';

import RSS from '../models/rss';
import Follow from '../models/follow';
import User from '../models/user';
import util from 'util';

import config from '../config';
import logger from '../utils/logger';
import async_tasks from '../async_tasks';
import axios from 'axios';
import FeedParser from 'feedparser';

// determines if the given feedUrl is a podcast or not
async function IsPodcastStream(feedStream, feedURL) {
	let posts = [];
	var end = new Promise(function(resolve, reject) {
		feedStream
			.pipe(new FeedParser())
			.on('error', reject)
			.on('end', () => {
				let isPodcast = posts.slice(0, 10).every(post => {
					return (
						post.enclosures.length &&
						post.enclosures[0].type.indexOf('audio') != -1
					);
				});
				resolve(isPodcast);
			})
			.on('readable', function() {
				var stream = this,
					item;
				while ((item = stream.read())) {
					posts.push(item);
				}
			});
	});
  return end
}

async function IsPodcastURL(feedURL) {
	let response = await axios({
		method: 'get',
		url: feedURL,
		responseType: 'stream',
	});
	let feedStream = response.data;
	isPodcast(feedStream, feedURL);
}

exports.IsPodcastStream = IsPodcastStream;
exports.IsPodcastURL = IsPodcastURL;
