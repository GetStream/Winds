import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';

export const EpisodeSchema = new Schema(
	{
		podcast: {
			type: Schema.Types.ObjectId,
			ref: 'Podcast',
			index: true,
			required: true,
			autopopulate: {
				select: [
					'title',
					'url',
					'feedUrl',
					'image',
					'categories',
					'description',
					'public',
					'valid',
					'publicationDate',
					'lastScraped',
					'images',
				],
			},
		},
		url: {
			type: String,
			trim: true,
			index: true,
			required: true,
		},
		title: {
			type: String,
			trim: true,
			required: true,
		},
		description: {
			type: String,
			trim: true,
			maxLength: 240,
			default: '',
		},
		images: {
			featured: {
				type: String,
				trim: true,
				default: '',
			},
			banner: {
				type: String,
				trim: true,
				default: '',
			},
			favicon: {
				type: String,
				trim: true,
				default: '',
			},
			og: {
				type: String,
				trim: true,
				default: '',
			},
		},
		duration: {
			type: String,
			default: '',
		},
		publicationDate: {
			type: Date,
			default: Date.now,
		},
		likes: {
			type: Number,
			default: 0,
		},
		valid: {
			type: Boolean,
			default: true,
		},
	},
	{ collection: 'episodes' },
);

EpisodeSchema.plugin(timestamps);
EpisodeSchema.plugin(mongooseStringQuery);
EpisodeSchema.plugin(autopopulate);

module.exports = exports = mongoose.model('Episode', EpisodeSchema);
