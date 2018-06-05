import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import {ArticleSchema} from "./article";

export const RSSSchema = new Schema(
	{
		url: {
			type: String,
			trim: true,
		},
		feedUrl: {
			type: String,
			trim: true,
			lowercase: true,
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
		categories: {
			type: String,
			trim: true,
			default: '',
		},
		featured: {
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
			index: true,
		},
		likes: {
			type: Number,
			default: 0,
		},
		summary: {
			type: String,
			default: '',
		},
		interest: {
			type: String,
			default: '',
			index: true,
		},
		isParsing: {
			type: Boolean,
			default: false,
		},
		language: {
			type: String,
			default: '',
		},
	},
	{ collection: 'rss' },
);

RSSSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});

RSSSchema.methods.searchDocument = function() {
	return {
		_id: this._id,
		objectID: this._id,
		categories: 'RSS',
		description: this.title,
		image: this.favicon,
		public: true,
		publicationDate: this.publicationDate,
		title: this.title,
		type: 'rss',
	};
};

RSSSchema.index({featured: 1}, {partialFilterExpression: {featured: true}});

RSSSchema.plugin(mongooseStringQuery);

module.exports = exports = mongoose.model('RSS', RSSSchema);
