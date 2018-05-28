import { expect, request } from 'chai'
import sinon from 'sinon'
import StreamFeed from 'getstream/src/lib/feed'

import api from '../../src/server'
import auth from '../../src/controllers/auth'
import User from '../../src/models/user'

 import { mockClient } from '../../src/utils/test'

describe('Auth controller', () => {
    describe('signup', () => {
        beforeEach(async () => { await User.remove().exec(); })

        it('should return 200 for valid request', async () => {
            const mockFeed = sinon.createStubInstance(StreamFeed);
            mockFeed.follow.returns(Promise.resolve());

            mockClient.feed.returns(mockFeed);

            const response = await request(api).post('/auth/signup').send({
                email: 'valid@email.com',
                username: 'valid',
                name: 'Valid Name',
                password: 'valid_password'
            });

            expect(response).to.have.status(200);
        })
    })
})
