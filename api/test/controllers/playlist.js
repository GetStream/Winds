import { expect, request } from 'chai';

import User from '../../src/models/user';
import Playlist from '../../src/models/playlist';
import api from '../../src/server';
import { dropDBs, loadFixture, withLogin } from '../utils';

describe('Playlist controller', () => {
    const otherUserId = '4342306d8e147f10f16aceaf';
    let user;
    let playlist;

    before(async () => {
        await dropDBs();
        await loadFixture('initial-data', 'playlists');

        user = await User.findOne();
        playlist = await Playlist.findOne();
    });
    describe('listing all entries', () => {
        // api.route('/playlists').get(Playlist.list);
    });

    describe('retrieving entry by id', () => {
        it('should return 200 for valid request', async () => {
            const response = await withLogin(request(api).get(`/playlists/${playlist._id}`));

            expect(response).to.have.status(200);
        });

        it('should return 404 for invalid id', async () => {
            const response = await withLogin(request(api).get('/playlists/5b0f306d8e147f10deadbeef'));

            expect(response).to.have.status(404);
        });

        it('should return 403 when retrieving entries created by other users', async () => {
            const otherPlaylist = await Playlist.create({
                user: otherUserId,
                name: 'other playlist',
                episodes: []
            });
            const response = await withLogin(request(api).get(`/playlists/${otherPlaylist._id}`));

            expect(response).to.have.status(403);
        });

        it('should return 422 for invalid request', async () => {
            const response = await withLogin(request(api).get('/playlists/<bogus-id>/'));

            expect(response).to.have.status(422);
        });
    });

    describe('creating new entry', () => {
        // api.route('/playlists').post(Playlist.post);
    });

    describe('updating existing entry', () => {
        // api.route('/playlists/:playlistId').put(Playlist.put);
    });

    describe('deleting entry by id', () => {
        it('should return 204 for valid request', async () => {
            const response = await withLogin(request(api).delete(`/playlists/${playlist._id}`));

            expect(response).to.have.status(204);
        });

        it('shoudl return 404 for invalid id', async () => {
            const response = await withLogin(request(api).delete('/playlists/5b0f306d8e147f10deadbeef'));

            expect(response).to.have.status(404);
        });

        it('should return 403 when deleting entries created by other users', async () => {
            const otherPlaylist = await Playlist.create({
                user: otherUserId,
                name: 'other playlist',
                episodes: []
            });
            const response = await withLogin(request(api).delete(`/playlists/${otherPlaylist._id}`));

            expect(response).to.have.status(403);
        });

        it('should return 422 for invalid request', async () => {
            const response = await withLogin(request(api).delete('/playlists/<bogus-id>/'));

            expect(response).to.have.status(422);
        });
    });
});
