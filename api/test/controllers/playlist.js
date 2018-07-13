import sinon from 'sinon';
import { expect, request } from 'chai';

import User from '../../src/models/user';
import Playlist from '../../src/models/playlist';
import api from '../../src/server';
import logger from '../../src/utils/logger';
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
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get('/playlists'));

			expect(response).to.have.status(200);

			const keys = ['_id', 'user', 'name', 'episodes'];
			for (const entry of response.body) {
				expect(Object.keys(entry)).to.include.members(keys);
			}
		});

		it('should filter results if query is provided', async () => {
			const fileters = [
				{ episode: '5b0ad37026dc3db38194e286' },
				{ type: 'recommended' },
				{ type: 'featured' },
			];
			const response = await withLogin(
				request(api)
					.get('/playlists')
					.query(),
			);

			expect(response).to.have.status(200);

			const keys = ['_id', 'user', 'name', 'episodes'];
			for (const entry of response.body) {
				expect(Object.keys(entry)).to.include.members(keys);
			}
		});

		it('should return 403 when retrieving entries created by other users', async () => {
			const response = await withLogin(
				request(api)
					.get('/playlists')
					.query({ user: otherUserId }),
			);

			expect(response).to.have.status(403);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(
				request(api)
					.get('/playlists')
					.query({ episode: { $gte: '' } }),
			);

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('retrieving entry by id', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(
				request(api).get(`/playlists/${playlist._id}`),
			);

			expect(response).to.have.status(200);
			const keys = ['_id', 'user', 'name', 'episodes'];
			expect(Object.keys(response.body)).to.include.members(keys);

			expect(response.body._id).to.be.equal(String(playlist._id));
			expect(response.body.user._id).to.be.equal(String(playlist.user._id));
			expect(response.body.name).to.be.equal(playlist.name);
			//XXX: mocha seems to hang if we try to do a full compare
			expect(response.body.episodes.map(e => e._id)).to.have.all.members(
				playlist.episodes.map(e => String(e._id)),
			);
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).get('/playlists/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});

		it('should return 403 when retrieving entries created by other users', async () => {
			const otherPlaylist = await Playlist.create({
				user: otherUserId,
				name: 'other playlist',
				episodes: [],
			});
			const response = await withLogin(
				request(api).get(`/playlists/${otherPlaylist._id}`),
			);

			expect(response).to.have.status(403);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(request(api).get('/playlists/<bogus-id>/'));

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('creating new entry', () => {
		it('should return 200 for valid request', async () => {
			const data = {
				user: user.id,
				name: 'yet other playlist',
				episodes: ['5b0ad37626dc3db38194fa73'],
			};
			const response = await withLogin(
				request(api)
					.post('/playlists')
					.send(data),
			);

			expect(response).to.have.status(200);

			const keys = ['_id', 'user', 'name', 'episodes'];
			expect(Object.keys(response.body)).to.include.members(keys);
			const newPlaylist = await Playlist.findOne({ name: 'yet other playlist' });

			expect(response.body._id).to.be.equal(String(newPlaylist._id));
			expect(response.body.user._id).to.be.equal(data.user);
			expect(response.body.user._id).to.be.equal(String(newPlaylist.user._id));
			expect(response.body.name).to.be.equal(data.name);
			expect(response.body.name).to.be.equal(newPlaylist.name);
			//XXX: mocha seems to hang if we try to do a full compare
			expect(response.body.episodes.map(e => e._id)).to.have.all.members(
				data.episodes,
			);
			expect(response.body.episodes.map(e => e._id)).to.have.all.members(
				newPlaylist.episodes.map(e => String(e._id)),
			);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const data = { _id: 'Howdy pardner' };
			const response = await withLogin(
				request(api)
					.post('/playlists')
					.send(data),
			);

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('updating existing entry', () => {
		it('should return 200 for valid request', async () => {
			const data = {
				user: user.id,
				name: 'Episode w/ new name',
				episodes: playlist.episodes.map(e => e._id),
			};
			const response = await withLogin(
				request(api)
					.put(`/playlists/${playlist._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);

			const keys = ['_id', 'user', 'name', 'episodes'];
			expect(Object.keys(response.body)).to.include.members(keys);
			const updatedPlaylist = await Playlist.findById(playlist._id).lean();

			expect(response.body._id).to.be.equal(String(updatedPlaylist._id));
			expect(response.body.user._id).to.be.equal(data.user);
			expect(response.body.user._id).to.be.equal(String(updatedPlaylist.user._id));
			expect(response.body.name).to.be.equal(data.name);
			expect(response.body.name).to.be.equal(updatedPlaylist.name);
			//XXX: mocha seems to hang if we try to do a full compare
			expect(response.body.episodes.map(e => e._id)).to.have.all.members(
				data.episodes.map(String),
			);
			expect(response.body.episodes.map(e => e._id)).to.have.all.members(
				updatedPlaylist.episodes.map(e => String(e._id)),
			);
		});

		it('shoudl return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api)
					.put('/playlists/5b0f306d8e147f10deadbeef')
					.send(playlist),
			);

			expect(response).to.have.status(404);
		});

		it('should return 403 when updating entries created by other users', async () => {
			const otherPlaylist = await Playlist.create({
				user: otherUserId,
				name: 'other playlist',
				episodes: [],
			});
			const response = await withLogin(
				request(api)
					.put(`/playlists/${otherPlaylist._id}`)
					.send(playlist),
			);

			expect(response).to.have.status(403);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(
				request(api).delete('/playlists/<bogus-id>/'),
			);

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('deleting entry by id', () => {
		it('should return 204 for valid request', async () => {
			const response = await withLogin(
				request(api).delete(`/playlists/${playlist._id}`),
			);

			expect(response).to.have.status(204);
			expect(await Playlist.findById(playlist._id)).to.be.null;
		});

		it('shoudl return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).delete('/playlists/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});

		it('should return 403 when deleting entries created by other users', async () => {
			const otherPlaylist = await Playlist.create({
				user: otherUserId,
				name: 'other playlist',
				episodes: [],
			});
			const response = await withLogin(
				request(api).delete(`/playlists/${otherPlaylist._id}`),
			);

			expect(response).to.have.status(403);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(
				request(api).delete('/playlists/<bogus-id>/'),
			);

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});
});
