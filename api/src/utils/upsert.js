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

const duplicateKeyError = 11000;
const immutableFields = ['publicationDate', 'createdAt', 'updatedAt', 'id', '_id'];

const statsd = getStatsDClient();

// upsertManyPosts at once at super speed
export async function upsertManyPosts(publicationID, newPosts, schemaField) {
	// step 1: get the existing objects in mongodb
	const fingerprints = newPosts.map(p => p.fingerprint);
	const lookup = { [schemaField]: publicationID, fingerprint: { $in: fingerprints } };
	const schema = schemaField == 'rss' ? Article : Episode;
	const existingPosts = await schema.find(lookup).lean();
	const existingPostsMap = {};
	for (const post of existingPosts) {
		existingPostsMap[post.fingerprint] = post;
	}

	// step 2: make a list of posts we should update
	const operationMap = { new: [], changed: [], unchanged: [] };
	const operations = [];
	for (const post of newPosts) {
		if (!post[schemaField]) {
			throw new Error(`You forgot to specify the ${schemaField} field`);
		}

		const data = post.toObject ? post.toObject() : post;
		if (post.fingerprint in existingPostsMap) {
			const existing = existingPostsMap[post.fingerprint];
			if (!postChanged(existing, post)) {
				operationMap.unchanged.push(data);
				continue;
			}

			// filter on both rss and fingerprint so we can use the index
			const filter = {
				[schemaField]: publicationID,
				fingerprint: existing.fingerprint,
			};
			const { _id, id, ...dataWithoutId } = data;
			operations.push({ updateOne: { filter: filter, update: dataWithoutId } });
			operationMap.changed.push({ _id: existing._id, ...dataWithoutId });
		} else {
			operations.push({ insertOne: { document: data } });
			operationMap.new.push(data);
		}
	}

	// step 3: apply the update via bulkWrite
	// https://docs.mongodb.com/manual/core/bulk-write-operations/
	// http://mongoosejs.com/docs/api.html#bulkwrite_bulkWrite
	if (operations.length) {
		try {
			await schema.bulkWrite(operations, { ordered: false });
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

	return operationMap;
}

export function normalizePost(post) {
	const postObject = post.toObject ? post.toObject() : post;
	// these ids are not present in the RSS feed, so that causes issues
	for (let e of postObject.enclosures) {
		delete e['_id'];
	}
	return postObject;
}

// compare 2 posts and see if they changed
export function normalizedDiff(existingPost, newPost) {
	let existingObject = normalizePost(existingPost);
	let newObject = normalizePost(newPost);
	// handle the fact that images are updated via OG scraping, so we only care if more became available
	newObject.images = Object.assign(existingObject.images, newObject.images);
	let objectDiff = diff(existingObject, newObject);
	// remove the immutable fields from the diff
	for (let f of immutableFields) {
		delete objectDiff[f];
	}
	return Object.keys(objectDiff);
}

export function postChanged(existingPost, newPost) {
	return normalizedDiff(existingPost, newPost).length != 0;
}
