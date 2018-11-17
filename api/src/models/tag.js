import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';

export const TagSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
			autopopulate: {
				select: ['name', 'email', 'username'],
			},
		},
		episode: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Episode',
				required: true,
				autopopulate: true,
			},
		],
		article: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Article',
				required: true,
				autopopulate: true,
			},
		],
		name: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{ collection: 'tags' },
);

TagSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
TagSchema.plugin(mongooseStringQuery);
TagSchema.plugin(autopopulate);

module.exports = exports = mongoose.model('Tag', TagSchema);
