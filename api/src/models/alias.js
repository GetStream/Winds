import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';

export const AliasSchema = new Schema(
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
		rss: {
			type: Schema.Types.ObjectId,
			ref: 'RSS',
			autopopulate: {
				select: ['url', 'title'],
			},
		},
		podcast: {
			type: Schema.Types.ObjectId,
			ref: 'Podcast',
			autopopulate: {
				select: ['url', 'title'],
			},
		},
		alias: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{ collection: 'aliases' },
);

AliasSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
AliasSchema.plugin(mongooseStringQuery);
AliasSchema.plugin(autopopulate);

module.exports = exports = mongoose.model('Alias', AliasSchema);
