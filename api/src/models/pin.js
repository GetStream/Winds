import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';

export const PinSchema = new Schema(
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
		},
		article: {
			type: Schema.Types.ObjectId,
			ref: 'Article',
			autopopulate: {
				select: [
					'parent',
					'url',
					'title',
					'description',
					'images',
					'publicationDate',
				],
			},
		},
		episode: {
			type: Schema.Types.ObjectId,
			ref: 'Episode',
			autopopulate: {
				select: [
					'parent',
					'url',
					'title',
					'description',
					'images',
					'publictionDate',
				],
			},
		},
	},
	{ collection: 'pins' },
);

PinSchema.plugin(timestamps);
PinSchema.plugin(mongooseStringQuery);
PinSchema.plugin(autopopulate);

module.exports = exports = mongoose.model('Pin', PinSchema);
