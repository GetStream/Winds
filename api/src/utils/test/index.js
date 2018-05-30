import sinon from 'sinon'
import bcrypt from 'bcryptjs'
import rewiremock from 'rewiremock'
import stream from 'getstream'
import mongoose from 'mongoose'

let mockClient = null;
const mockFeeds = {};

export function getMockFeed(group, id) {
    return mockFeeds[group + ':' + id];
}

export function getMockClient() {
    return mockClient;
}

export function setupMocks() {
    const client = mockClient = sinon.createStubInstance(stream.Client);
    client.feed.callsFake((group, id) => {
        const mock = {
            slug: group,
            userId: id,
            id: group + ':' + id,
            follow: sinon.spy(sinon.stub().returns(Promise.resolve()))
        };
        mockFeeds[group + ':' + id] = mock;
        return mock;
    });

    rewiremock('getstream').with({ connect: sinon.stub().returns(client) });
    rewiremock('../events').with(sinon.stub().returns(Promise.resolve()));

    rewiremock.enable();
}

export async function loadFixture(fixture) {
    const filters = {
        'User': async (user) => {
            user.password = await bcrypt.hash(user.password, 8)
            return user;
        }
    };
    const models = require(`../../../test/fixtures/${fixture}.json`);

    for (const modelName in models) {
        const model = mongoose.model(modelName);
        const filter = filters[modelName] || ((x) => Promise.resolve(x));
        const filteredData = await Promise.all(models[modelName].map(filter));

        await model.collection.insertMany(filteredData);
    }
}
