import { expect, request } from 'chai';

import api from '../../src/server';
import auth from '../../src/controllers/auth';
import Podcast from '../../src/models/podcast';
import RSS from '../../src/models/rss';
import User from '../../src/models/user';
import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';
import fs from 'fs';
import path from 'path';
import FeedParser from 'feedparser';

// load fixture with follows and feeds
// setup a users
// test the get
// - auth is required
// - verify that the right data is there
// post
// - large files
// - different extensions
// - folder/no folder OPML
// detect feed type codebase
// - various formats

describe.only('OPML', () => {
	describe('Export', () => {
		before(async () => {
			await loadFixture('opml');
		});

		describe('invalid request', () => {
			let response;
			let user;

			before(async () => {
				response = await request(api).get('/opml');
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});

		describe('valid request', () => {
			let response;
			let user;

			before(async () => {
				response = await request(api)
					.get('/opml')
					.set('Bearer', '123');
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});
	});
	describe('Import', () => {
		describe('valid request', () => {
			let response;
			let user;

			before(async () => {
				response = await request(api)
					.post('/opml')
					.set('Bearer', '123')
					.attach(
						'imageField',
						fs.readFileSync(path.join(__dirname, '..', 'data', 'test.opml')),
						'test.opml',
					);
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});
	});
	describe.only('Feed Type', () => {
		async function isPodcast() {
			// its a podcast if every article has an enclosure of the audio type
			let p = path.join(__dirname, '..', 'data', 'feed', 'giant-bomcast')
      let posts = []
      fs.createReadStream(p)
        .on('error', function (error) {
          console.error(error);
        })
        .pipe(new FeedParser())
        .on('error', function (error) {
          console.error(error);
        })
        .on('meta', function (meta) {
          console.log('===== %s =====', meta.title);
        })
        .on('end', function () {
          let isPodcast = posts.slice(0,10).every(post => {
            return post.enclosures && post.enclosures[0].type.indexOf('audio') != -1
          });
          console.log("isPodcast", isPodcast)

        })
        .on('readable', function() {
          var stream = this, item;
          while (item = stream.read()) {
            posts.push(item)
          }
        });
		}


		describe('is podcast', () => {
			isPodcast()
		});
	});
});
