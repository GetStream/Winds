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
					'link',
					'enclosure',
					'feedUrl',
					'image',
					'categories',
					'description',
					'public',
					'valid',
					'publicationDate',
					'lastScraped',
					'images',
					'featured',
				],
			},
		},
		// legacy field, only used for episode uniqueness lookup
		url: {
			type: String,
			trim: true,
			index: true,
			required: true,
		},
		// link stores a link to the podcast (not always available)
		link: {
			type: String,
			trim: true
		},
		// enclosure stores the mp3 for the episode (not always available)
		enclosure: {
			type: String,
			trim: true
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
