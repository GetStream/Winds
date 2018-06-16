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

const streamClient = stream.connect(
	config.stream.apiKey,
	config.stream.apiSecret,
);
const duplicateKeyError = 11000;
const immutableFields = ['publicationDate', 'createdAt', 'updatedAt', 'id', '_id'];

const statsd = getStatsDClient();

// upsertManyPosts at once at super speed
export async function upsertManyPosts(publicationID, newPosts, publicationType) {
	let schema = publicationType == 'rss' ? Article : Episode;
	let schemaField = publicationType;

	// step 1: get the existing objects in mongodb
	let fingerprints = newPosts.map(p => p.fingerprint);
	let lookup = { fingerprint: { $in: fingerprints } };
	lookup[schemaField] = publicationID;
	let existingPosts = await schema.find().lean();
	let existingPostsMap = {};
	for (let p of existingPosts) {
		existingPostsMap[p.fingerprint] = p;
	}

	// step 2: make a list of posts we should update
	let operationMap = { new: [], changed: [], unchanged: [] };
	let operations = [];
	for (let p of newPosts) {
		if (!p[schemaField]) {
			throw new Error(`You forgot to specify the ${schemaField} field`);
		}
		let postData = p.toObject ? p.toObject() : p;
		if (p.fingerprint in existingPostsMap) {
			let existing = existingPostsMap[p.fingerprint];
			if (postChanged(existing, p)) {
				// make sure we don't use the generated mongodb id that hasn't been saved yet
				// we want the new data, with the old id
				p._id = existing._id;
				operationMap.changed.push(p);
				// filter on both rss and fingerprint so we can use the index
				const filter = { fingerprint: existing.fingerprint };
				filter[schemaField] = publicationID;
        delete postData['_id'];
				operations.push({
					updateOne: {
						filter: filter,
						update: postData,
					},
				});
			} else {
				operationMap.unchanged.push(p);
			}
		} else {
			// insert scenario
			operationMap.new.push(p);

			operations.push({
				insertOne: {
					document: postData,
				},
			});
		}
	}

	// step 3: apply the update via bulkWrite
	// https://docs.mongodb.com/manual/core/bulk-write-operations/
	// http://mongoosejs.com/docs/api.html#bulkwrite_bulkWrite
	if (operations.length) {
		try {
			let response = await schema.bulkWrite(operations, { ordered: false });
		} catch (e) {
      // since we use an unordered query it doesnt matter if we hit a few unique constraints
			if (e.code != duplicateKeyError) {
				throw e;
			}
		}
	}

	// step 4: statsd tracking on new, updated and unchanged
	// TODO: Tommaso! Do you agree with the format?
	for (const [k, v] of Object.entries(operationMap)) {
		statsd.increment(`winds.handle_rss.${schemaField}.${k}`, v.length);
	}

  // sanity check
  let updated = operationMap.new.concat(operationMap.changed)
  for (let u of updated) {
    if (!u._id) {
      throw Error(`missing id for object ${u.fingerprint} and feed ${publicationID}`)
    }
  }

	return operationMap;
}

export function normalizePost(post) {
	let postObject = post.toObject ? post.toObject() : post;
	// these ids are not present in the RSS feed, so that causes issues
	for (let e of postObject.enclosures) {
		delete e['_id'];
	}
	return postObject;
}

// compare 2 posts and see if they changed
export function postChanged(existingPost, newPost) {
	let existingObject = normalizePost(existingPost);
	let newObject = normalizePost(newPost);
	// handle the fact that images are updated via OG scraping, so we only care if more became available
	newObject.images = Object.assign(existingObject.images, newObject.images);
	let objectDiff = diff(existingObject, newObject);
	// remove the immutable fields from the diff
	for (let f of immutableFields) {
		delete objectDiff[f];
	}
	let changes = Object.keys(objectDiff).length;

	return changes;
}
