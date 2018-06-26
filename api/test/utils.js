import bcrypt from 'bcryptjs';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import redis from 'redis';
import sinon from 'sinon';
import { expect, request } from 'chai';
import StreamClient from 'getstream/src/lib/client';

import api from '../src/server';
import config from '../src/config';
import db from '../src/utils/db';
import logger from '../src/utils/logger';
import { CreateFingerPrints } from '../src/parsers/feed';

var mockClient = null;
const mockFeeds = {};

export function createMockFeed(group, id) {
	const mock = {
		slug: group,
		userId: id,
		id: group + ':' + id,
	};
	for (const method of ['follow', 'addActivity', 'addActivities', 'get', 'unfollow']) {
		mock[method] = sinon.spy(sinon.stub().returns(Promise.resolve({ results: [] })));
	}
	mock['getReadOnlyToken'] = sinon.spy(sinon.stub().returns('faketoken'));
	mockFeeds[group + ':' + id] = mock;
	return mock;
}

export function getMockFeed(group, id) {
	return mockFeeds[group + ':' + id];
}

function setupMocks() {
	mockClient = sinon.createStubInstance(StreamClient);
	mockClient.collections = {
		upsert: sinon.spy(sinon.stub().returns(Promise.resolve({ results: [] }))),
	};
	mockClient.feed.callsFake((group, id) => {
		return mockFeeds[group + ':' + id] || createMockFeed(group, id);
	});
}
export function getMockClient() {
	if (mockClient == null) {
		setupMocks();
	}

	return mockClient;
}

export function getTestFeed(name) {
	return fs.createReadStream(path.join(__dirname, 'data', 'feed', name));
}

export function getTestPodcast(name) {
	return fs.createReadStream(path.join(__dirname, 'data', 'podcast-feed', name));
}

export function getTestPage(name) {
	return fs.createReadStream(path.join(__dirname, 'data', 'og', name));
}

export async function loadFixture(...fixtures) {
	const filters = {
		Article: articles => {
			for (const article of articles) {
				article.enclosures = article.enclosures || [];
			}
			CreateFingerPrints(articles);
			return articles;
		},
		Episode: episodes => {
			for (const episode of episodes) {
				episode.enclosures = episode.enclosures || [];
			}
			CreateFingerPrints(episodes);
			return episodes;
		},
	};

	for (const fixture of fixtures) {
		const batch = require(`./fixtures/${fixture}.json`);

		for (const models of batch) {
			for (const modelName in models) {
				const fixedData = models[modelName].map(data => {
					//XXX: cloning loaded json to enable filtering without thinking about module cache
					data = Object.assign({}, data);
					//XXX: convert things that look like ObjectID to actual ObjectID
					//     instances to enable mongo references
					for (const key in data) {
						//XXX: reject number attributes (see bug: https://jira.mongodb.org/browse/NODE-1146)
						if (
							typeof data[key] !== 'number' &&
							mongoose.Types.ObjectId.isValid(data[key])
						) {
							data[key] = mongoose.Types.ObjectId(data[key]);
						}
					}
					return data;
				});
				const filter = filters[modelName] || (x => x);
				const filteredData = filter(fixedData);

				const modulePath = `../src/models/${modelName.toLowerCase()}`;
				//XXX: hack to avoid loading models explicitly before loading fixtures
				//     also avoids compiling model modules twice as mocked module loader
				//     with babel forces recompilation of transpiled source code which
				//     causes double-registration of mongoose models
				const cachedModule = require.cache[require.resolve(modulePath)];
				const model = cachedModule ? cachedModule.exports : require(modulePath);
				await Promise.all(
					filteredData.map(f => {
						return model.create(f);
					}),
				);
			}
		}
	}
}

export function withLogin(
	req,
	user = {
		email: 'valid@email.com',
		sub: '5b0f306d8e147f10f16aceaf',
	},
) {
	const authToken = jwt.sign(user, config.jwt.secret);
	return req.set('Authorization', `Bearer ${authToken}`);
}

export async function dropDBs() {
	const redisClient = redis.createClient(config.cache.uri);
	const mongo = await db;
	await mongo.connection.dropDatabase();
	await redisClient.send_command('FLUSHDB');
}
