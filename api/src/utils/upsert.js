import { diff, detailedDiff } from 'deep-object-diff';
import stream from 'getstream';
import moment from 'moment';
import normalize from 'normalize-url';

import RSS from '../models/rss';
import Article from '../models/article';
import Podcast from '../models/podcast';
import Episode from '../models/episode';

import config from '../config';
import logger from '../utils/logger';

import { getStatsDClient, timeIt } from '../utils/statsd';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);
const duplicateKeyError = 11000;


// upsertManyPosts at once at super speed
export async function upsertManyPosts(publicationID, newPosts, publicationType) {
  let schema = (publicationType == 'rss') ? Article, Episode
  let schemaField = publicationType

  // step 1: get the existing objects in mongodb
  let fingerprints = newPosts.map(p=>p.fingerprint)
  let existingPosts = schema.find({fingerprint: {$in: fingerprints}})
  let existingPostsMap = {}
  for (let p of existingPosts) {
    existingPostsMap[p.fingerprint] = p
  }

  // step 2: make a list of posts we should update
  let toUpdateOrCreate = []
  let operations = []
  for (let p of newPosts) {
    if (p.fingerprint in existingPostsMap) {
      let existing = existingPostsMap[p.fingerprint]
      if (postChanged(existing, p)) {
        toUpdateOrCreate.push(p)
        // filter on both rss and fingerprint so we can use the index
        const filter = {fingerprint: existing.fingerprint}
        filter[schemaField] = publicationID
        operations.push({
          updateOne: {
            filter: filter,
            update: p
          }
        })
      }
    } else {
      toUpdateOrCreate.push(p)
      operations.push({
        insertOne: {
          document: p
        }
      })
    }
  }

  // step 3: apply the update
  // https://docs.mongodb.com/manual/core/bulk-write-operations/
  // http://mongoosejs.com/docs/api.html#bulkwrite_bulkWrite
  let response = await Article.bulkWrite(operations)
  // TODO: How to handle errors, such as duplicate keys
  console.log(response)

  // step 4: send the updated records to stream

  // step 5: statsd tracking on new, updated and unchanged
  // TODO: Tommaso!

  return toUpdateOrCreate
}

// compare 2 posts and see if they changed
export function postChanged(existingPost, newPost) {
  let d = diff(existingPost, newPost)
  let immutableFields = ['publicationDate']
  console.log(d)

}
