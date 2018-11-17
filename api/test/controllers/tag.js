import { expect, request } from 'chai';
import { dropDBs, loadFixture, withLogin } from '../utils';

import Tag from '../../src/models/tag';
import api from '../../src/server';

describe('Tag controller', () => {
	const keys = ['_id', 'user', 'name', 'episode', 'article'];

	let tag;
	let tags;
	let authedUser = '5b0f306d8e147f10f16aceaf';

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'tags');

		tags = await Tag.find({ user: authedUser });
		tag = await Tag.findById('5bca58f5e4313757120c8810');
	});

	describe('list all tags', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get('/tags'));
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.equal(tags.length);
			expect(response.body.map((t) => t._id)).to.have.all.members(
				tags.map((t) => String(t._id)),
			);
			for (const entry of response.body)
				expect(Object.keys(entry)).to.include.members(keys);
		});
	});

	describe('retrieving tag by id', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get(`/tags/${tag._id}`));

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body._id).to.be.equal(String(tag._id));
			expect(response.body.name).to.be.equal(tag.name);
			expect(response.body.article.map((a) => a._id)).to.have.all.members(
				tag.article.map((a) => String(a._id)),
			);
			expect(response.body.episode.map((e) => e._id)).to.have.all.members(
				tag.episode.map((e) => String(e._id)),
			);
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).get('/tags/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('creating new tags', () => {
		it('should create a new tag by name only', async () => {
			const data = { name: 'newtag' };
			const response = await withLogin(
				request(api)
					.post('/tags')
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal(authedUser);
			expect(response.body.name).to.be.equal(data.name);
			expect(response.body.episode).to.be.empty;
			expect(response.body.article).to.be.empty;
		});

		it('should create a new tag with list of feeds', async () => {
			const data = {
				name: 'newNewtags',
				article: ['5b0ad37226dc3db38194e5ec', '5b0ad37226dc3db38194e5ed'],
				episode: ['5b0ad37026dc3db38194e286'],
			};
			const response = await withLogin(
				request(api)
					.post('/tags')
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal(authedUser);
			expect(response.body.name).to.be.equal(data.name);

			expect(response.body.article.map((a) => a._id)).to.have.all.members(
				data.article,
			);
			expect(response.body.episode.map((e) => e._id)).to.have.all.members(
				data.episode,
			);
		});
	});

	describe('updating existing tags', () => {
		it('should add article to a tag', async () => {
			const data = { article: '5b0ad37226dc3db38194e5ed' };
			const response = await withLogin(
				request(api)
					.put(`/tags/${tag._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal(authedUser);
			expect(response.body.name).to.be.equal(tag.name);
			expect(response.body.article.map((a) => String(a._id))).to.include(
				data.article,
			);
		});

		it('should delete article from a tag', async () => {
			const data = { article: '5b0ad37226dc3db38194e5ec', action: 'remove' };
			const response = await withLogin(
				request(api)
					.put(`/tags/${tag._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal(authedUser);
			expect(response.body.name).to.be.equal(tag.name);
			expect(response.body.article.map((a) => String(a._id))).to.not.include(
				data.article,
			);
		});

		it('should add episode to a tag', async () => {
			const data = { episode: '5b0ad37626dc3db38194fa73' };
			const response = await withLogin(
				request(api)
					.put(`/tags/${tag._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal(authedUser);
			expect(response.body.name).to.be.equal(tag.name);
			expect(response.body.episode.map((e) => String(e._id))).to.include(
				data.episode,
			);
		});

		it('should delete episode from a tag', async () => {
			const data = { episode: '5b0ad37626dc3db38194fa73', action: 'remove' };
			const response = await withLogin(
				request(api)
					.put(`/tags/${tag._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user._id).to.be.equal(authedUser);
			expect(response.body.name).to.be.equal(tag.name);
			expect(response.body.episode.map((p) => String(p._id))).to.not.include(
				data.episode,
			);
		});

		it('should update tags name', async () => {
			const data = { name: 'newName' };

			const response = await withLogin(
				request(api)
					.put(`/tags/${tag._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(response.body.name).to.be.equal(data.name);
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api)
					.put('/tags/5b0f306d8e147f10deadbeef')
					.send({ name: 'invalid' }),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('deleting tags by id', () => {
		it('should return 204 for valid request', async () => {
			const response = await withLogin(request(api).delete(`/tags/${tag._id}`));

			expect(response).to.have.status(204);
			expect(await Tag.findById(tag._id)).to.be.null;
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).delete('/tags/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});
	});
});
