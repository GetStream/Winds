import mongoose, { Schema } from 'mongoose';
import bcrypt from 'mongoose-bcrypt';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';

import FollowSchema from './follow';
import LikeSchema from './like';
import PinSchema from './pin';
import PlaylistSchema from './playlist';

import jwt from 'jsonwebtoken';
import config from '../config';

export const UserSchema = new Schema(
	{
		email: {
			type: String,
			lowercase: true,
			trim: true,
			index: true,
			unique: true,
			required: true,
		},
		username: {
			type: String,
			lowercase: true,
			trim: true,
			index: true,
			unique: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
			bcrypt: true,
		},
		name: {
			type: String,
			trim: true,
			required: true,
		},
		bio: {
			type: String,
			trim: true,
			default: '',
		},
		url: {
			type: String,
			trim: true,
			default: '',
		},
		twitter: {
			type: String,
			trim: true,
			default: '',
		},
		background: {
			type: Number,
			default: 1,
		},
		interests: {
			type: Schema.Types.Mixed,
			default: [],
		},
		preferences: {
			notifications: {
				daily: {
					type: Boolean,
					default: false,
				},
				weekly: {
					type: Boolean,
					default: true,
				},
				follows: {
					type: Boolean,
					default: true,
				},
			},
		},
		recoveryCode: {
			type: String,
			trim: true,
			default: '',
		},
		active: {
			type: Boolean,
			default: true,
		},
		admin: {
			type: Boolean,
			default: false,
		},
	},
	{
		collection: 'users',
		toJSON: {
			transform: function(doc, ret) {
				delete ret.password;
			},
		},
		toObject: {
			transform: function(doc, ret) {
				delete ret.password;
			},
		},
	},
);

UserSchema.post('remove', async function(user) {
	return await Promise.all([
		PinSchema.remove({user}),
		PlaylistSchema.remove({user}),
		FollowSchema.remove({user}),
		LikeSchema.remove({user}),
	]);
});

UserSchema.plugin(bcrypt);
UserSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
UserSchema.plugin(mongooseStringQuery);

UserSchema.index({ email: 1, username: 1 });

UserSchema.methods.serializeAuthenticatedUser = function serializeAuthenticatedUser () {
	let user = this;
	let serialized;

	serialized = {
		_id: user._id,
		email: user.email,
		interests: user.interests,
		jwt: jwt.sign( { email: user.email, sub: user._id }, config.jwt.secret),
		name: user.name,
		username: user.username,
		streamTokens: {
		},
	};
	return serialized;
};

module.exports = exports = mongoose.model('User', UserSchema);
