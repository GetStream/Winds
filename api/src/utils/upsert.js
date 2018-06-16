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
const immutableFields = ['publicationDate', 'createdAt', 'updatedAt', 'id', '_id']

const statsd = getStatsDClient();


// upsertManyPosts at once at super speed
export async function upsertManyPosts(publicationID, newPosts, publicationType) {
  let schema = (publicationType == 'rss') ? Article : Episode
  let schemaField = publicationType

  // step 1: get the existing objects in mongodb
  let fingerprints = newPosts.map(p=>p.fingerprint)
  let existingPosts = await schema.find({fingerprint: {$in: fingerprints}}).lean()
  let existingPostsMap = {}
  for (let p of existingPosts) {
    existingPostsMap[p.fingerprint] = p
  }

  // step 2: make a list of posts we should update
  let operationMap = {new: [], changed: [], unchanged: []}
  let operations = []
  for (let p of newPosts) {
    let postData = p.toObject()
    delete postData['_id']
    if (p.fingerprint in existingPostsMap) {
      let existing = existingPostsMap[p.fingerprint]
      if (postChanged(existing, p)) {
        operationMap.changed.push(p)
        // filter on both rss and fingerprint so we can use the index
        const filter = {fingerprint: existing.fingerprint}
        filter[schemaField] = publicationID
        operations.push({
          updateOne: {
            filter: filter,
            update: postData
          }
        })
      } else {
        operationMap.unchanged.push(p)
      }
    } else {
      // insert scenario
      operationMap.new.push(p)

      operations.push({
        insertOne: {
          document: postData
        }
      })
    }
  }

  // step 3: apply the update via bulkWrite
  // https://docs.mongodb.com/manual/core/bulk-write-operations/
  // http://mongoosejs.com/docs/api.html#bulkwrite_bulkWrite
  if (operations.length) {
    let response = await schema.bulkWrite(operations)
    // TODO: How to handle errors, such as duplicate keys
  }

  // step 4: statsd tracking on new, updated and unchanged
  // TODO: Tommaso! Do you agree with the format?
  for (const [k,v] of Object.entries(operationMap)) {
    statsd.increment(`winds.handle_rss.${schemaField}.${k}`, v.length);
  }

  return operationMap
}

export function normalizePost(post) {
  let postObject = (post.toObject) ? post.toObject() : post
  // these ids are not present in the RSS feed, so that causes issues
  for (let e of postObject.enclosures) {
    delete e['_id']
  }
  return postObject
}

// compare 2 posts and see if they changed
export function postChanged(existingPost, newPost) {
  let existingObject = normalizePost(existingPost)
  let newObject = normalizePost(newPost)
  // handle the fact that images are updated via OG scraping, so we only care if more became available
  newObject.images = Object.assign(existingObject.images, newObject.images);
  let objectDiff = diff(existingObject, newObject)
  // remove the immutable fields from the diff
  for (let f of immutableFields) {
    delete objectDiff[f]
  }
  let changes = Object.keys(objectDiff).length

  return changes
}
