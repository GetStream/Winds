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
import jwt from 'jsonwebtoken';
import config from '../../src/config';


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

function authGetRequest(getPath) {
  const token = jwt.sign(
      {
          email: 'test+test@test.com',
          sub: '5b0f306d8e147f10f16aceaf',
      },
      config.jwt.secret,
  );
  return request(api).get(getPath).set('Authorization', `Bearer ${token}`)
}

describe.only('OPML', () => {
	describe.only('Export', () => {
		before(async () => {
			await loadFixture('initialData', 'opml');
		});

		describe('invalid request', () => {
			let response;
			let user;

			before(async () => {
				response = await request(api).get('/opml/download');
			});

			it('should return 401', () => {
				expect(response).to.have.status(401);
			});
		});

		describe.only('valid request', () => {
			let response;
			let user;

			before(async () => {
				response = await authGetRequest('/opml/download')
			});

			it('should return 200', () => {
				expect(response).to.have.status(200);
        console.log('r', response.body)
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
	describe('Feed Type', () => {
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
