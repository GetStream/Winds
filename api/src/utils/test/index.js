import sinon from 'sinon'
import rewiremock from 'rewiremock'
import stream from 'getstream'

export const mockClient = sinon.createStubInstance(stream.Client);

export function setupMocks() {
    rewiremock('getstream').with({ connect: sinon.stub().returns(mockClient) });
    rewiremock('../events').with(sinon.stub().returns(Promise.resolve()));

    rewiremock.enable();
}
