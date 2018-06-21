import { expect, request } from 'chai';

import User from '../../src/models/user';
import FollowSchema from '../../src/models/follow';
import PinSchema from '../../src/models/pin';
import PlaylistSchema from '../../src/models/playlist';
import PodcastSchema from '../../src/models/podcast';
import EpisodeSchema from '../../src/models/episode';
import { loadFixture } from '../utils';

describe('User model', () => {
	let user;

	before(async () => {
		await loadFixture('user_model');
		user = await User.findOne();
		const promises = [PinSchema, FollowSchema, PlaylistSchema].map(async schema => {
			expect(await schema.find({ user })).to.be.an('array').that.is.not.empty;
		});
		await Promise.all(promises);
	});

	after(async () => {
		const promises = [
			User,
			FollowSchema,
			PinSchema,
			PlaylistSchema,
			PodcastSchema,
			EpisodeSchema,
		].map(async model => {
			await model.remove();
		});
		await Promise.all(promises);
	});

	describe('remove document', () => {
		it('should remove the User and all Pins, Playlists, Follows and Likes with a foreign key to the User', async () => {
			await user.remove();
			const promises = [PinSchema, FollowSchema, PlaylistSchema].map(
				async schema => {
					expect(await schema.findOne({ user }), schema.modelName).to.be.null;
				},
			);
			await Promise.all(promises);
		});
	});
});
