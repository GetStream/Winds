import { expect, request } from 'chai';

import api from '../../src/server';
import Alias from '../../src/models/alias';
import Podcast from '../../src/models/podcast';
import Rss from '../../src/models/rss';
import { loadFixture, withLogin, dropDBs } from '../utils';

describe('Alias controller', () => {
	let alias;
	let podcast;
	let rss;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'aliases');

		alias = await Alias.findOne();
		podcast = await Podcast.findOne();
		rss = await Rss.findOne();
	});

	describe('list', () => {
		it('should return all aliases', async () => {
			const res = await withLogin(request(api).get('/aliases'));
			expect(res).to.have.status(200);
		});
	});

	describe('get', () => {
		it('should return a single alias via /aliases/:aliasId', async () => {
			const res = await withLogin(request(api).get(`/aliases/${alias._id}`));
			expect(res).to.have.status(200);
		});
	});

	describe('post', () => {
		it('should try to create empty alias and return error', async () => {
			const res = await withLogin(request(api).post('/aliases'));
			expect(res).to.have.status(422);
		});
	});

	describe('post', () => {
		it('should create an RSS alias and return the alias', async () => {
			const res = await withLogin(
				request(api)
					.post('/aliases')
					.send({ alias: 'name', rss: rss._id }),
			);
			expect(res).to.have.status(200);
			expect(res.body).to.have.property('rss');
			expect(res.body.alias).to.be.equal('name');
		});
	});

	describe('post', () => {
		it('should create an Podcast alias and return the alias', async () => {
			const res = await withLogin(
				request(api)
					.post('/aliases')
					.send({ alias: 'name', podcast: podcast._id }),
			);
			expect(res).to.have.status(200);
			expect(res.body).to.have.property('podcast');
			expect(res.body.alias).to.be.equal('name');
		});
	});

	describe('put', () => {
		it('should update the existed alias', async () => {
			const res = await withLogin(
				request(api)
					.put(`/aliases/${alias._id}`)
					.send({ alias: 'newName' }),
			);
			expect(res).to.have.status(200);
			expect(res.body.alias).to.be.equal('newName');
		});
	});

	describe('delete', () => {
		it('should delete a alias', async () => {
			let res = await withLogin(request(api).delete(`/aliases/${alias._id}`));
			expect(res).to.have.status(204);
			res = await withLogin(request(api).delete(`/aliases/${alias._id}`));
			expect(res).to.have.status(404);
		});
	});
});
