import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';

export const FolderSchema = new Schema(
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
		rss: [
			{
				type: Schema.Types.ObjectId,
				ref: 'RSS',
				required: true,
				autopopulate: true,
			},
		],
		podcast: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Podcast',
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
	{ collection: 'folders' },
);

FolderSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
FolderSchema.plugin(mongooseStringQuery);
FolderSchema.plugin(autopopulate);

module.exports = exports = mongoose.model('Folder', FolderSchema);
