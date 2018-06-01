import { expect, request } from 'chai';

import api from '../../src/server';
import User from '../../src/models/user';
import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';
import { withLogin } from '../utils';

describe('User controller', () => {
  let authUser = {
    email: 'test_user@email.com',
    password: 'testuser',
  };

  describe('remove user', () => {
    let user;

    beforeEach(async () => {
      await loadFixture('users');
      user = await User.findOne({email: 'test_user@email.com'});
      expect(user).to.not.be.null;
    })

    afterEach(async () => {
      await User.remove().exec();
    });

    describe('valid request', () => {
      let response;

      beforeEach(async () => {
        response = await withLogin(
          api,
          request(api).delete(`/users/${user._id}`),
          authUser
        );
      });

      it('should return 204', async () => {
        expect(response).to.have.status(204);
      });

      it('should remove the User model', async () => {
        expect(await User.findOne({_id: user._id})).to.be.null;
      });
    });

    describe('invalid requests', () => {
      it('should return 403 for unauthorized access to an existing user resource', async () => {
        let anotherUser = await User.findOne({email: 'another_user@email.com'});

        let response = await withLogin(
          api,
          request(api).delete(`/users/${anotherUser.id}`),
          authUser
        );

        expect(response).to.have.status(403);
        expect(await User.findOne({_id: anotherUser._id})).to.not.be.null;
      });

      it('should return 403 unauthorized access to a non-existing user resource', async () => {
        let nonExistingId = '5b10e1c601e9b8702ccfb974';
        expect(await User.findOne({_id: nonExistingId})).to.be.null;

        let response = await withLogin(
          api,
          request(api).delete(`/users/${nonExistingId}`),
          authUser
        );
        expect(response).to.have.status(403);
      });

      it('should return 401 for non-authenticated access', async () => {
        let response = await request(api).delete(`/users/${user._id}`);

        expect(response).to.have.status(401);
        expect(await User.findOne({_id: user._id})).to.not.be.null;
      });
    });

  });
});
