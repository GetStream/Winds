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

		rss = await RSS.findOne();
		podcast = await Podcast.findOne();
		user = await User.findById('5b0f306d8e147f10f16aceaf');
	});

	describe('get', () => {
		it('should return all follows where type is RSS', async () => {
			const res = await withLogin(request(api).get('/follows?type=rss'));
			expect(res).to.have.status(200);
		});

		it('should return all follows where type is podcast', async () => {
			const res = await withLogin(request(api).get('/follows?type=podcast'));
			expect(res).to.have.status(200);
		});

		it('should fail when an unauthenticated user attempts to read RSS follows', async () => {
			const res = await request(api).get('/follows?type=rss');
			expect(res).to.have.status(401);
		});

		it('should fail when an unauthenticated user attempts to read podcast follows', async () => {
			const res = await request(api).get('/follows?type=podcast');
			expect(res).to.have.status(401);
		});

		it('should return hydrated follows where type is RSS', async () => {
			const res = await withLogin(request(api).get('/follows?type=rss'));
			expect(res).to.have.status(200);
			expect(res.body[0].rss).to.have.own.property('_id');
			expect(res.body[0].user).to.have.own.property('_id');
		});

		it('should return hydrated follows where type is podcast', async () => {
			const res = await withLogin(request(api).get('/follows?type=podcast'));
			expect(res).to.have.status(200);
			expect(res.body[0].rss).to.be.undefined;
			expect(res.body[0].podcast).to.have.own.property('_id');
			expect(res.body[0].user).to.have.own.property('_id');
		});

		it('should return a specific RSS follow relationship', async () => {
			const res = await withLogin(
				request(api).get(`/follows?user=${user._id}&rss=${followedRSS.rss._id}`),
			);
			expect(res).to.have.status(200);
			expect(res.body[0]._id).to.equal(followedRSS._id.toString());
		});

		it('should return a specific podcast follow relationship', async () => {
			const res = await withLogin(
				request(api).get(
					`/follows?user=${user._id}&podcast=${followedPodcast.podcast._id}`,
				),
			);
			expect(res).to.have.status(200);
			expect(res.body[0]._id).to.equal(followedPodcast._id.toString());
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

		it('should throw an error when adding a podcast follow without a required field', async () => {
			const res = await withLogin(
				request(api)
					.post('/follows')
					.send({ podcast: podcast._id }),
			);
			expect(res).to.have.status(422);
		});
		it('should throw an error when adding a follow without a required rss or podcast field', async () => {
			const res = await withLogin(
				request(api)
					.post('/follows')
					.send({ user: user._id }),
			);
			expect(res).to.have.status(422);
		});
		it('should follow an RSS feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&rss=${rss._id}`),
			);
			expect(res).to.have.status(200);
		});
		it('should follow a podcast feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=podcast&podcast=${podcast._id}`),
			);
			expect(res).to.have.status(200);
		});
		it('should fail to follow a non existing RSS feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&rss=5b3084e0000000000000000a`),
			);
			expect(res).to.have.status(404);
		});
		it('should fail to follow a non existing podcast feed', async () => {
			const res = await withLogin(
				request(api).post(
					`/follows?type=podcast&podcast=5b3084e0000000000000000b`,
				),
			);
			expect(res).to.have.status(404);
		});
		it('should follow an existing RSS feed', async () => {
			const res = await withLogin(
				request(api).post(`/follows?type=rss&rss=${followedRSS.rss._id}`),
			);
			expect(res).to.have.status(200);
		});
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
			const follow = await Follow.create({
				user: user._id,
				rss: '6b0ad0baf6f89574a638887a',
			});
			const res = await withLogin(
				request(api).delete(`/follows?type=rss&rss=${follow.rss._id}`),
			);
			expect(res).to.have.status(204);
			expect(await Follow.findById(follow._id)).to.be.null;
		});
		it('should remove a podcast follow relationship', async () => {
			const follow = await Follow.create({
				user: user._id,
				podcast: '6afb7fedfe7430d35996d66e',
			});
			const res = await withLogin(
				request(api).delete(
					`/follows?type=podcast&podcast=${follow.podcast._id}`,
				),
			);
			expect(res).to.have.status(204);
			expect(await Follow.findById(follow._id)).to.be.null;
		});
		it('should not fail when the follow relationship does not exist', async () => {
			const res = await withLogin(
				request(api).delete(`/follows?type=rss&rss=8b0ad0baf6f89574a638887a`),
			);
			expect(res).to.have.status(204);
		});
	});
});
