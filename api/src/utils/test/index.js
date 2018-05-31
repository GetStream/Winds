import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import StreamClient from 'getstream/src/lib/client';
import mongoose from 'mongoose';
import logger from '../logger';

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

export async function loadFixture(...fixtures) {
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

	for (let fixture of fixtures) {
		logger.info(`loaded fixture with name ${fixture}`)
		const models = require(`../../../test/fixtures/${fixture}.json`);

		for (let modelName in models) {
			let model = mongoose.model(modelName);
			let filter = filters[modelName] || ((x) => Promise.resolve(x));
			let filteredData = await Promise.all(models[modelName].map(filter));
			console.log(filteredData)

			await model.collection.insertMany(filteredData);
		}
	}

}
