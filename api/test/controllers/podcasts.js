import { expect, request } from 'chai';
import { withLogin } from '../utils.js';
import api from '../../src/server';
import { loadFixture } from '../../src/utils/test';
import Podcast from '../../src/models/podcast';
import {reset} from '../utils';

describe('Podcast controller', () => {
	let podcast;

	before(async () => {
		await reset();
		await loadFixture('initialData');
		podcast = await Podcast.findOne({});
		expect(podcast).to.not.be.null;
	});

	describe('get podcast', () => {
		it('should return the right rss feed from /podcasts/:podcastId', async () => {
			const response = await withLogin(
				request(api).get(`/podcasts/${podcast._id}`)
			);
			expect(response).to.have.status(200);
			expect(response.body._id).to.eq(`${podcast._id}`);
		});
	});

	describe('add Podcast', () => {
		let podcast;

		it('should create podcast from thetwentyminutevc.libsyn.com/rss', async () => {
			const response = await withLogin(
				request(api)
					.post('/podcasts')
					.send({'feedUrl': 'http://thetwentyminutevc.libsyn.com/rss'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(1);
			expect(response.body[0].url).to.eq('http://thetwentyminutevc.com');
			podcast = await Podcast.find({url:'http://thetwentyminutevc.com'});
		});

		it('2nd time should not create or update anything', async () => {
			const response = await withLogin(
				request(api)
					.post('/podcasts')
					.send({'feedUrl': 'http://thetwentyminutevc.libsyn.com/rss'})
			);
			expect(response).to.have.status(201);
			expect(response.body).to.have.length(0);

			let podcast2 = await Podcast.find({url:'http://thetwentyminutevc.com'});
			expect(podcast2.updatedAt).to.eq(podcast.updatedAt);
		});

	});
});
