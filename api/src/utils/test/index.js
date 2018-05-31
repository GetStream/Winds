import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import StreamClient from 'getstream/src/lib/client';
import mongoose from 'mongoose';

let mockClient = null;
const mockFeeds = {};

export function getMockFeed(group, id) {
	return mockFeeds[group + ':' + id];
}

function setupMocks() {
	mockClient = sinon.createStubInstance(StreamClient);
	mockClient.feed.callsFake((group, id) => {
		const mock = mockFeeds[group + ':' + id] || {
			slug: group,
			userId: id,
			id: group + ':' + id,
			follow: sinon.spy(sinon.stub().returns(Promise.resolve())),
		};
		mockFeeds[group + ':' + id] = mock;
		return mock;
	});
}

export function getMockClient() {
	if (mockClient == null) {
		setupMocks();
	}

	return mockClient;
}

export async function loadFixture(fixture) {
	const filters = {
		User: async (user) => {
			//XXX: cloning loaded json to enable filtering without thinking about module cache
			user = Object.assign({}, user);

			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(user.password, salt);
			user.password = hash;
			return user;
		},
	};
	const models = require(`../../../test/fixtures/${fixture}.json`);

	for (const modelName in models) {
		const model = mongoose.model(modelName);
		const filter = filters[modelName] || ((x) => Promise.resolve(x));
		const filteredData = await Promise.all(models[modelName].map(filter));

		await model.collection.insertMany(filteredData);
	}
}
