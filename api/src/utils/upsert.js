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
const immutableFields = ['publicationDate', 'createdAt', 'updatedAt']

const statsd = getStatsDClient();


// upsertManyPosts at once at super speed
export async function upsertManyPosts(publicationID, newPosts, publicationType) {
  let schema = (publicationType == 'rss') ? Article : Episode
  let schemaField = publicationType

  // step 1: get the existing objects in mongodb
  let fingerprints = newPosts.map(p=>p.fingerprint)
  let existingPosts = await schema.find({fingerprint: {$in: fingerprints}})
  let existingPostsMap = {}
  for (let p of existingPosts) {
    existingPostsMap[p.fingerprint] = p
  }

  // step 2: make a list of posts we should update
  let operationMap = {new: [], changed: [], unchanged: []}
  let operations = []
  for (let p of newPosts) {
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
            update: p.toObject()
          }
        })
      } else {
        operationMap.unchanged.push(p)
      }
    } else {
      // insert scenario
      operationMap.new.push(p)
      let o = p.toObject()
      operations.push({
        insertOne: {
          document: o
        }
      })
    }
  }

  // step 3: apply the update via bulkWrite
  // https://docs.mongodb.com/manual/core/bulk-write-operations/
  // http://mongoosejs.com/docs/api.html#bulkwrite_bulkWrite
  if (operations.length) {
    let response = await Article.bulkWrite(operations)
    // TODO: How to handle errors, such as duplicate keys
  }

  // step 4: statsd tracking on new, updated and unchanged
  // TODO: Tommaso! Do you agree with the format?
  for (const [k,v] of Object.entries(operationMap)) {
    statsd.increment(`winds.handle_rss.${schemaField}.${k}`, v.length);
  }

  return operationMap
}

// compare 2 posts and see if they changed
export function postChanged(existingPost, newPost) {
  let existingObject = (existingPost.toObject) ? existingPost.toObject() : existingPost
  let newObject = (newPost.toObject) ? newPost.toObject() : newPost
  let objectDiff = diff(existingObject, newObject)
  // remove the immutable fields from the diff
  for (let f of immutableFields) {
    delete objectDiff[f]
  }
  let changes = Object.keys(objectDiff).length
  return changes
}
