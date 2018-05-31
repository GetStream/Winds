import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';

export const PodcastSchema = new Schema(
	{
		url: {
			type: String,
			trim: true,
		},
		feedUrl: {
			type: String,
			trim: true,
			index: true,
			unique: true,
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
			default: '',
		},
		summary: {
			type: String,
			trim: true,
			default: '',
		},
		categories: {
			type: String,
			trim: true,
			default: '',
		},
		featured: {
			type: Boolean,
			default: false,
		},
		isParsing: {
			type: Boolean,
			default: false,
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
		public: {
			type: Boolean,
			default: true,
		},
		publicationDate: {
			type: Date,
			default: Date.now,
		},
		valid: {
			type: Boolean,
			default: true,
		},
		lastScraped: {
			type: Date,
			default: Date.now,
		},
		interest: {
			type: String,
			default: '',
			index: true,
		},
		language: {
			type: String,
			default: '',
		},
	},
	{
		collection: 'podcasts',
		toJSON: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
			},
		},
		toObject: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
			},
		},
	},
);

PodcastSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
PodcastSchema.plugin(mongooseStringQuery);

module.exports = exports = mongoose.model('Podcast', PodcastSchema);
