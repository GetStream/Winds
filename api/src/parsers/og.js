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
import {ReadFeedURL} from './index.js'
const metaTagRe = /(<meta.*og:image".*>)/gm;
const urlRe = /content="(.*?)"/gm;

// determines if the given feedUrl is a podcast or not
export async function ParseOG(pageURL) {
  let pageStream = await ReadFeedURL(pageURL)
  let ogImage = await ParseOGStream(pageStream, pageURL)
  return ogImage
}

export async function ParseOGStream(pageStream, pageURL) {
	let items = [];
	var end = new Promise(function(resolve, reject) {
		pageStream
			.on('error', reject)
			.on('end', () => {
				resolve(items);
			})
			.on('readable', function() {
				var stream = this,
					item;
				while ((item = stream.read())) {
          let html = item.toString('utf8')
          if (html.indexOf('og:image') != -1){
            let m;

            while ((m = metaTagRe.exec(html)) !== null) {
            	// This is necessary to avoid infinite loops with zero-width matches
            	if (m.index === metaTagRe.lastIndex) {
            		regex.lastIndex++;
            	}

            	// The result can be accessed through the `m`-variable.
            	let meta = m[0]
              let url = urlRe.exec(meta)[1]
              return resolve(url)
            }

          }
				}
			});
	});
  return end
}
