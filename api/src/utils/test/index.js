import sinon from 'sinon'
import bcrypt from 'bcryptjs'
import rewiremock from 'rewiremock'
import stream from 'getstream'
import mongoose from 'mongoose'

export const mockClient = sinon.createStubInstance(stream.Client);

export function setupMocks() {
    mockClient.feed.callsFake((group, id) => {
        return {
            slug: group,
            userId: id,
            id: group + ':' + id,
            follow: sinon.stub().returns(Promise.resolve())
        };
    });

    rewiremock('getstream').with({ connect: sinon.stub().returns(mockClient) });
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
        const filter = filters[modelName] || Promise.resolve;
        const filteredData = await Promise.all(models[modelName].map(filter));

        await model.collection.insertMany(filteredData);
    }
}
