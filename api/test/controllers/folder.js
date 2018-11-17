import { expect, request } from 'chai';
import { dropDBs, loadFixture, withLogin } from '../utils';

import Folder from '../../src/models/folder';
import api from '../../src/server';

describe('Folder controller', () => {
	const keys = ['_id', 'user', 'name', 'rss', 'podcast', 'createdAt'];

	let folder;
	let folders;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'folders');

		folders = await Folder.find({ user: '5b0f306d8e147f10f16aceaf' });
		folder = await Folder.findById('5bbb10d3ec7e1d8e1c5b6705');
	});

	describe('list all folders', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get('/folders'));
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.equal(folders.length);
			expect(response.body.map((f) => f._id)).to.have.all.members(
				folders.map((f) => String(f._id)),
			);
			for (const entry of response.body)
				expect(Object.keys(entry)).to.include.members(keys);
		});
	});

	describe('retrieving folder by id', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get(`/folders/${folder._id}`));

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body._id).to.be.equal(String(folder._id));
			expect(response.body.name).to.be.equal(folder.name);
			expect(response.body.rss.map((r) => r._id)).to.have.all.members(
				folder.rss.map((r) => String(r._id)),
			);
			expect(response.body.podcast.map((p) => p._id)).to.have.all.members(
				folder.podcast.map((p) => String(p._id)),
			);
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).get('/folders/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('retrieving folder feeds by id', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(
				request(api).get(`/folders/${folder._id}/feed`),
			);
			expect(response).to.have.status(200);
			expect(response.body).to.be.an('array');
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).get('/folders/5b0f306d8e147f10deadbeef/feeds'),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('creating new folder', () => {
		it('should create a new folder by name only', async () => {
			const data = { name: 'newfolder' };
			const response = await withLogin(
				request(api)
					.post('/folders')
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal('5b0f306d8e147f10f16aceaf');
			expect(response.body.name).to.be.equal(data.name);
			expect(response.body.rss).to.be.empty;
			expect(response.body.podcast).to.be.empty;
		});

		it('should create a new folder with list of rss/podcasts', async () => {
			const data = {
				name: 'newNewfolder',
				rss: ['5b0ad0baf6f89574a638887e'],
				podcast: ['5afb7f68fe7430d35996cc62'],
			};
			const response = await withLogin(
				request(api)
					.post('/folders')
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal('5b0f306d8e147f10f16aceaf');
			expect(response.body.name).to.be.equal(data.name);
			expect(response.body.rss.map((r) => String(r._id))).to.have.all.members(
				data.rss,
			);
			expect(response.body.podcast.map((p) => String(p._id))).to.have.all.members(
				data.podcast,
			);
		});
	});

	describe('updating existing folder', () => {
		it('should delete rss from folder', async () => {
			const data = { rss: '5b0ad0baf6f89574a638887a', action: 'remove' };
			const response = await withLogin(
				request(api)
					.put(`/folders/${folder._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal('5b0f306d8e147f10f16aceaf');
			expect(response.body.name).to.be.equal(folder.name);
			expect(response.body.rss.map((r) => String(r._id))).to.not.include(data.rss);
		});

		it('should add rss to folder', async () => {
			const data = { rss: '5b0ad0baf6f89574a638887a' };
			const response = await withLogin(
				request(api)
					.put(`/folders/${folder._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal('5b0f306d8e147f10f16aceaf');
			expect(response.body.name).to.be.equal(folder.name);
			expect(response.body.rss.map((r) => String(r._id))).to.include(data.rss);
		});

		it('should add podcast to folder', async () => {
			const data = { podcast: '5afb7f68fe7430d35996cc62' };
			const response = await withLogin(
				request(api)
					.put(`/folders/${folder._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal('5b0f306d8e147f10f16aceaf');
			expect(response.body.name).to.be.equal(folder.name);
			expect(response.body.podcast.map((p) => String(p._id))).to.include(
				data.podcast,
			);
		});

		it('should delete rss from folder', async () => {
			const data = { podcast: '5afb7f68fe7430d35996cc62', action: 'remove' };
			const response = await withLogin(
				request(api)
					.put(`/folders/${folder._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal('5b0f306d8e147f10f16aceaf');
			expect(response.body.name).to.be.equal(folder.name);
			expect(response.body.podcast.map((p) => String(p._id))).to.not.include(
				data.podcast,
			);
		});

		it('should update folder name', async () => {
			const data = { name: 'newName' };

			const response = await withLogin(
				request(api)
					.put(`/folders/${folder._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(response.body.name).to.be.equal(data.name);
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api)
					.put('/folders/5b0f306d8e147f10deadbeef')
					.send(folder),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('deleting folder by id', () => {
		it('should return 204 for valid request', async () => {
			const response = await withLogin(
				request(api).delete(`/folders/${folder._id}`),
			);

			expect(response).to.have.status(204);
			expect(await Folder.findById(folder._id)).to.be.null;
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).delete('/folders/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});
	});
});
