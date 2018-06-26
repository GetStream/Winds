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
	let publicationType = this.rss ? 'rss' : 'podcast';
	let feedGroup = this.rss ? 'user_article' : 'user_episode';
	let publicationID = this.rss ? this.rss._id : this.podcast._id;
	let userID = this.user._id;
	let timelineFeed = getStreamClient().feed('timeline', userID);
	let otherFeed = getStreamClient().feed(feedGroup, userID);
	let results = await Promise.all([
		timelineFeed.unfollow(publicationType, publicationID),
		otherFeed.unfollow(publicationType, publicationID),
	]);
	return results;
};

FollowSchema.statics.getOrCreateMany = async function getOrCreateMany(follows) {
	// validate
	for (let f of follows) {
		if (f.type != 'rss' && f.type != 'podcast') {
			throw new Error(`invalid follow type ${f.type}`);
		}
	}
	// batch create the follow relationships
	let followInstances = [];
	for (let f of follows) {
		let query = { user: f.userID };
		query[f.type] = f.publicationID;
		let instance = await this.findOne(query).lean();
		if (!instance) {
			instance = await this.create(query);
		}
		followInstances.push(instance);
	}

	// sync to stream in a batch
	let feedRelations = [];
	for (let f of follows) {
		let feedGroup = f.type == 'rss' ? 'user_article' : 'user_episode';
		// sync to stream
		feedRelations.push({
			source: `timeline:${f.userID}`,
			target: `${f.type}:${f.publicationID}`,
		});
		feedRelations.push({
			source: `${feedGroup}:${f.userID}`,
			target: `${f.type}:${f.publicationID}`,
		});
	}
	let response = await getStreamClient().followMany(feedRelations);

	// update the counts
	for (let f of follows) {
		// update the follow count
		let countQuery = {};
		countQuery[f.type] = f.publicationID;
		let followerCount = await this.count(countQuery);
		let schema = f.type == 'rss' ? RSS : Podcast;
		// update the count
		await schema.update(
			{ _id: f.publicationID },
			{
				followerCount: followerCount,
			},
		);
	}

	return followInstances;
};

FollowSchema.statics.getOrCreate = async function getOrCreate(
	followType,
	userID,
	publicationID,
) {
	let instances = await this.getOrCreateMany([
		{ type: followType, userID: userID, publicationID: publicationID },
	]);
	return instances[0];
};

module.exports = exports = mongoose.model('Follow', FollowSchema);
module.exports.FollowSchema = FollowSchema;
