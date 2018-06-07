import { expect, request } from 'chai';

import User from '../../src/models/user';
import Listen from '../../src/models/listen';
import api from '../../src/server';
import { dropDBs, loadFixture, withLogin } from '../utils';

describe('Listen controller', () => {
    const episodeId = '5b0ad37026dc3db38194e286';
    const otherUserId = '5b0f306d8e147f10f16aceb0';
    let user;
    let listen;

    before(async () => {
        await dropDBs();
        await loadFixture('initial-data', 'listens');

        user = await User.findOne();
        listen = await Listen.findOne();
    });

    describe('listing all entries', () => {
        it('should return 200 for valid request', async () => {
            const response = await withLogin(request(api).get('/listens'));

            expect(response).to.have.status(200);
        });

        it('should filter results if query is provided', async () => {
            const response = await withLogin(request(api).get('/listens').query({ episode: episodeId }));

            expect(response).to.have.status(200);
        });

        it('should return 403 when retrieving entries created by other users', async () => {
            const response = await withLogin(request(api).get('/listens').query({ user: otherUserId }));

            expect(response).to.have.status(403);
        });

        it('should return 422 for invalid request', async () => {
            const response = await withLogin(request(api).get('/listens').query({ episode: { $gte: '' } }));

            expect(response).to.have.status(422);
        });
    });

    describe('retrieving entry by id', () => {
        it('should return 200 for valid request', async () => {
            const response = await withLogin(request(api).get(`/listens/${listen._id}`));

            expect(response).to.have.status(200);
        });

        it('should return 404 for invalid id', async () => {
            const response = await withLogin(request(api).get('/listens/5b0f306d8e147f10deadbeef'));

            expect(response).to.have.status(404);
        });

        it('should return 403 when retrieving entries created by other users', async () => {
            const otherListen = await Listen.create({
                user: otherUserId,
                episode: episodeId
            });
            const response = await withLogin(request(api).get(`/listens/${otherListen._id}`));

            expect(response).to.have.status(403);
        });

        it('should return 422 for invalid request', async () => {
            const response = await withLogin(request(api).get('/listens/<bogus-id>/'));

            expect(response).to.have.status(422);
        });
    });

    describe('upsert entry', () => {
        it('should return 200 for new entry', async () => {
            const response = await withLogin(
                request(api)
                    .post('/listens')
                    .send({
                        user: user._id,
                        episode: episodeId,
                        duration: 0
                    })
            );

            expect(response).to.have.status(200);
        });

        it('should return 200 for existing entry', async () => {
            const response = await withLogin(
                request(api)
                    .post('/listens')
                    .send({
                        _id: listen._id,
                        user: user._id,
                        episode: episodeId,
                        duration: 10
                    })
            );

            expect(response).to.have.status(200);
        });

        it('should return 422 for invalid request', async () => {
            const response = await withLogin(
                request(api)
                    .post('/listens')
                    .send({ episode: { $gte: { and: 1 } } })
            );

            expect(response).to.have.status(422);
        });
    });

    describe('deleting entry by id', () => {
        it('should return 204 for valid request', async () => {
            const response = await withLogin(request(api).delete(`/listens/${listen._id}`));

            expect(response).to.have.status(204);
        });

        it('shoudl return 404 for invalid id', async () => {
            const response = await withLogin(request(api).delete('/listens/5b0f306d8e147f10deadbeef'));

            expect(response).to.have.status(404);
        });

        it('should return 403 when deleting entries created by other users', async () => {
            const otherListen = await Listen.create({
                user: otherUserId,
                episode: episodeId
            });
            const response = await withLogin(request(api).delete(`/listens/${otherListen._id}`));

            expect(response).to.have.status(403);
        });

        it('should return 422 for invalid request', async () => {
            const response = await withLogin(request(api).delete('/listens/<bogus-id>/'));

            expect(response).to.have.status(422);
        });
    });
});
