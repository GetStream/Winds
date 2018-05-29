import sinon from 'sinon'
import rewiremock from 'rewiremock'
import stream from 'getstream'
import StreamFeed from 'getstream/src/lib/feed'

export const mockClient = sinon.createStubInstance(stream.Client);

export function setupMocks() {
    const mockFeed = sinon.createStubInstance(StreamFeed);
    mockFeed.follow.returns(Promise.resolve());

    mockClient.feed.returns(mockFeed);

    rewiremock('getstream').with({ connect: sinon.stub().returns(mockClient) });
    rewiremock('../events').with(sinon.stub().returns(Promise.resolve()));

    rewiremock.enable();
}
