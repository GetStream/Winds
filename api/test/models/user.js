import { expect, request } from 'chai';

import User from '../../src/models/user';
import FollowSchema from '../../src/models/follow';
import LikeSchema from '../../src/models/like';
import PinSchema from '../../src/models/pin';
import PlaylistSchema from '../../src/models/playlist';
import PodcastSchema from '../../src/models/podcast';
import EpisodeSchema from '../../src/models/episode';
import { loadFixture } from '../../src/utils/test';

describe('User model', () => {
	let user;

	before(async () => {
		await loadFixture('user_model');
		user = await User.findOne();
		[PinSchema, FollowSchema, LikeSchema, PlaylistSchema].forEach(async (schema) => {
			expect(await schema.find({user})).to.be.an('array').that.is.not.empty;
		})
	});

	after(async () => {
		[User, FollowSchema, LikeSchema, PinSchema, PlaylistSchema, PodcastSchema, EpisodeSchema].forEach(async (model) => {
			await model.remove();
		})
	});

	describe('remove document', () => {

		it('should remove the User and all Pins, Playlists, Follows and Likes with a foreign key to the User', async () => {
			await user.remove();
			[PinSchema, FollowSchema, LikeSchema, PlaylistSchema].forEach(async (schema) => {
				expect(await schema.findOne({user})).to.be.null;
			});
		});


	});

});
