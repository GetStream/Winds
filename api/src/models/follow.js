import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import stream from 'getstream';
import config from '../config';
import RSS from './rss';
import Podcast from './podcast';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret);

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

FollowSchema.statics.getOrCreate = async function getOrCreate(
	followType,
	userID,
	publicationID,
) {
	if (followType != 'rss' && followType != 'podcast') {
		throw new Error(`invalid follow type ${followType}`);
	}
	// see if we already have the follow relationship
	let query = { user: userID };
	query[followType] = publicationID;
	let instance = await this.findOne(query).lean();
	if (!instance) {
		instance = await this.create(query);
		let feedGroup = (followType == 'rss') ? 'user_article' : 'user_episode'
		// sync to stream
		await Promise.all([
			streamClient.feed(feedGroup, userID).follow(followType, publicationID),
			streamClient.feed('timeline', userID).follow(followType, publicationID),
		]);
		// update the follow count
		let countQuery = {}
		countQuery[followType] = publicationID
		let followerCount = await this.count(countQuery)
		let schema = (followType == 'rss') ? RSS : Podcast
		// update the count
		await schema.update(
			{ _id: publicationID },
			{
				followerCount: followerCount,
			}
		);
	}
	return instance;
};

module.exports = exports = mongoose.model('Follow', FollowSchema);
