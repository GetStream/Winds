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
import { ReadPageURL } from './feed.js';
const metaTagRe = /(<meta.*og:image".*>)/gm;
const urlRe = /content="(.*?)"/gm;
import zlib from 'zlib';

const invalidExtensions = ['mp3', 'mp4', 'mov', 'm4a', 'mpeg'];


// determines if the given feedUrl is a podcast or not
export async function ParseOG(pageURL) {
	let pageStream = await ReadPageURL(pageURL);
	let ogImage = await ParseOGStream(pageStream, pageURL);
	return ogImage;
}

export async function IsValidOGUrl(url) {
	let invalid = invalidExtensions.some(extension=> {
		if( url.endsWith(`.${extension}`)) {
			return extension;
		}
	});
	if (invalid) {
		logger.warn(`Invalid file extension for url ${url}`);
		return false;
	}

	return true;
}

export async function ParseOGStream(pageStream, pageURL) {


	var end = new Promise(function(resolve, reject) {
		pageStream
			.on('error', reject)
			.on('end', () => {
				resolve(null);
			})
			.on('readable', function() {
				var stream = this,
					item;
				while ((item = stream.read())) {
					let html = item.toString('utf8');
					if (html.indexOf('og:image') != -1) {
						let matches = metaTagRe.exec(html);

						if (matches) {
							let meta = matches[1];
							let urlMatches = urlRe.exec(meta);
							if (urlMatches) {
								return resolve(urlMatches[1]);
							}
						}
					}
				}
			});
	});
	return end;
}
