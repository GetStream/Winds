import { expect, request } from 'chai';

import api from '../../src/server';
import Follow from '../../src/models/follow';
import RSS from '../../src/models/rss';
import Podcast from '../../src/models/podcast';
import User from '../../src/models/user';
import { loadFixture, withLogin, dropDBs } from '../utils';

describe('Follow controller', () => {
	let followedRSS;
	let followedPodcast;
	let rss;
	let podcast;
	let user;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'follows');

		followedRSS = await Follow.findOne({ rss: { $exists: true, $ne: null } });
		followedPodcast = await Follow.findOne({ podcast: { $exists: true, $ne: null } });

		rss = (await RSS.find()
			.sort('_id')
			.limit(1))[0];
		podcast = (await User.find()
			.sort('_id')
			.limit(1))[0];
		user = (await User.find()
			.sort('_id')
			.limit(1))[0];
	});

	describe('get', () => {
		it('should return all follows where type is RSS', async () => {
			const res = await withLogin(request(api).get('/follows?type=rss'));
			expect(res).to.have.status(200);
		});
	});

	describe('get', () => {
		it('should return all follows where type is podcast', async () => {
			const res = await withLogin(request(api).get('/follows?type=podcast'));
			expect(res).to.have.status(200);
		});
	});

	describe('get', () => {
		it('should fail when an unauthenticated user attempts to read RSS follows', async () => {
			const res = await request(api).get('/follows?type=rss');
			expect(res).to.have.status(401);
		});
	});

	describe('get', () => {
		it('should fail when an unauthenticated user attempts to read podcast follows', async () => {
			const res = await request(api).get('/follows?type=podcast');
			expect(res).to.have.status(401);
		});
	});

	describe('get', () => {
		it('should return hydrated follows where type is RSS', async () => {
			const res = await withLogin(request(api).get('/follows?type=rss'));
			expect(res).to.have.status(200);
			expect(res.body[0]).to.have.own.property('rss');
			expect(res.body[0]).to.have.own.property('user');
		});
	});

	describe('get', () => {
		it('should return hydrated follows where type is podcast', async () => {
			const res = await withLogin(request(api).get('/follows'));
			expect(res).to.have.status(200);
			expect(res.body[0]).to.have.own.property('podcast');
			expect(res.body[0]).to.have.own.property('user');
		});
	});

    describe('get', () => {
		it('should return an RSS object if the current user follows the provided feed', async () => {
			const res = await withLogin(request(api).get(`/follows?user=${user._id}&rss={followedRSS.rss._id}`));
			expect(res).to.have.status(200);
		});
	});

	describe('post', () => {
		it('should throw an error when adding an RSS follow without a required field', async () => {
			const res = await withLogin(
				request(api)
					.post('/follows')
					.send({ rss: rss._id }),
			);
			expect(res).to.have.status(422);
		});
	});

	describe('post', () => {
		it('should throw an error when adding a podcast follow without a required field', async () => {
			const res = await withLogin(
				request(api)
					.post('/follows')
					.send({ podcast: podcast._id }),
			);
			expect(res).to.have.status(422);
		});
	});

	describe('post', () => {
		it('should throw an error when adding a follow without a required rss or podcast field', async () => {
			const res = await withLogin(
				request(api)
					.post('/follows')
					.send({ user: user._id }),
			);
			expect(res).to.have.status(422);
		});
	});

	describe('post', () => {
		it('should follow an RSS feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&rss=${podcast._id}`),
			);
			expect(res).to.have.status(200);
		});
	});

	describe('post', () => {
		it('should follow a podcast feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&podcast=${podcast._id}`),
			);
			expect(res).to.have.status(200);
		});
	});

	describe('post', () => {
		it('should follow a non existing RSS feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&rss=5b3084e0000000000000000a`),
			);
			expect(res).to.have.status(404);
		});
	});

	describe('post', () => {
		it('should follow a non existing podcast feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&podcast=5b3084e0000000000000000b`),
			);
			expect(res).to.have.status(404);
		});
	});

	describe('post', () => {
		it('should follow an existing RSS feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&rss=${followedRSS.rss._id}`),
			);
			expect(res).to.have.status(200);
		});
	});

	describe('post', () => {
		it('should follow an existing podcast feed', async () => {
			const res = await withLogin(
				request(api).post(
					`/follows?type=podcast&podcast=${followedPodcast.podcast._id}`,
				),
			);
			expect(res).to.have.status(200);
		});
	});

    describe('delete', () => {
		it('should remove an RSS follow relationship', async () => {
			const res = await withLogin(
				request(api).delete(
					`/follows?type=rss&rss=${followedRSS.rss._id}`,
				),
			);
			expect(res).to.have.status(204);
		});
	});

    describe('delete', () => {
		it('should remove a podcast follow relationship', async () => {
			const res = await withLogin(
				request(api).delete(
					`/follows?type=podcast&podcast=${followedPodcast.podcast._id}`,
				),
			);
			expect(res).to.have.status(204);
		});
	});

    describe('delete', () => {
		it('should remove a follow relationship that does not exist', async () => {
			const res = await withLogin(
				request(api).delete(
					`/follows?type=rss&rss=${followedRSS.rss._id}`,
				),
			);
			expect(res).to.have.status(204);
		});
	});
});
