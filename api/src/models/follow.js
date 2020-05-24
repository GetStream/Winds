import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import stream from 'getstream';
import config from '../config';
import RSS from './rss';
import Podcast from './podcast';
import { getStreamClient } from '../utils/stream';

export const FollowSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			autopopulate: {
				select: [
					'name',
					'email',
					'username',
					'bio',
					'url',
					'twitter',
					'background',
					'admin',
				],
			},
			index: true,
		},
		followee: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			autopopulate: {
				select: [
					'name',
					'email',
					'username',
					'bio',
					'url',
					'twitter',
					'background',
				],
			},
			index: true,
		},
		podcast: {
			type: Schema.Types.ObjectId,
			ref: 'Podcast',
			autopopulate: {
				select: [
					'url',
					'title',
					'categories',
					'description',
					'feedUrl',
					'image',
					'publicationDate',
					'public',
					'featured',
					'images',
					'duplicateOf',
				],
			},
			index: true,
		},
		rss: {
			type: Schema.Types.ObjectId,
			ref: 'RSS',
			autopopulate: {
				select: [
					'url',
					'title',
					'categories',
					'description',
					'favicon',
					'publicationDate',
					'public',
					'featured',
					'images',
					'feedUrl',
					'duplicateOf',
				],
			},
			index: true,
		},
		feed: {
			type: String,
			enum: ['rss', 'podcast', 'timeline'],
		},
	},
	{ collection: 'follows' },
);

FollowSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
FollowSchema.plugin(mongooseStringQuery);
FollowSchema.plugin(autopopulate);
FollowSchema.index({ user: 1, rss: 1, podcast: 1 }, { unique: true });

FollowSchema.methods.removeFromStream = async function remove(follows) {
	const publicationType = this.rss ? 'rss' : 'podcast';
	const feedGroup = this.rss ? 'user_article' : 'user_episode';
	const publicationID = this.rss ? this.rss._id : this.podcast._id;
	if (!this.user) {
		return [];
	}

	const timelineFeed = getStreamClient().feed('timeline', this.user._id);
	const otherFeed = getStreamClient().feed(feedGroup, this.user._id);
	const results = await Promise.all([
		timelineFeed.unfollow(publicationType, publicationID),
		otherFeed.unfollow(publicationType, publicationID),
	]);
	return results;
};

FollowSchema.statics.getOrCreateMany = async function getOrCreateMany(follows) {
	// validate
	for (const f of follows) {
		if (f.type != 'rss' && f.type != 'podcast') {
			throw new Error(`invalid follow type ${f.type}`);
		}
	}

	// batch create the follow relationships
	const followInstances = await Promise.all(
		follows.map(async (f) => {
			const query = { [f.type]: f.publicationID, user: f.userID };
			return this.findOneAndUpdate(query, query, {
				upsert: true,
				new: true,
			}).lean();
		}),
	);

	// sync to stream in a batch
	const feedRelationsTimeline = follows.map((f) => {
		return {
			source: `timeline:${f.userID}`,
			target: `${f.type}:${f.publicationID}`,
		};
	});
	const feedRelationsGroup = follows.map((f) => {
		const feedGroup = f.type == 'rss' ? 'user_article' : 'user_episode';
		return {
			source: `${feedGroup}:${f.userID}`,
			target: `${f.type}:${f.publicationID}`,
		};
	});
	const feedRelations = feedRelationsTimeline.concat(feedRelationsGroup);
	if (feedRelations.length > 0) {
		await getStreamClient().followMany(feedRelations);
	}

	// update the counts
	await Promise.all(
		follows.map(async (f) => {
			const followerCount = await this.count({ [f.type]: f.publicationID });
			const schema = f.type == 'rss' ? RSS : Podcast;
			await schema.update({ _id: f.publicationID }, { followerCount });
		}),
	);

	return followInstances;
};

FollowSchema.statics.getOrCreate = async function getOrCreate(
	followType,
	userID,
	publicationID,
) {
	const instances = await this.getOrCreateMany([
		{ type: followType, userID: userID, publicationID: publicationID },
	]);
	return instances[0];
};

module.exports = exports = mongoose.model('Follow', FollowSchema);
module.exports.FollowSchema = FollowSchema;
