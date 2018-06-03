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
import {ReadFeedURL} from './feed.js'

// determines if the given feedUrl is a podcast or not
export async function IsPodcastStream(feedStream, feedURL) {
	let posts = await ReadFeedStream(stream);
	let isPodcast = false
	if (posts) {
		isPodcast = posts.slice(0, 10).every(post => {
			return (
				post.enclosures.length &&
				post.enclosures[0].type.indexOf('audio') != -1
			);
		});
	}
  return isPodcast
}

// IsPodcastURL checks if the given url is a podcast or not
export async function IsPodcastURL(feedURL) {
	let feedStream = await ReadFeedURL(feedUrl);
	return await IsPodcastStream(feedStream, feedURL);
}
