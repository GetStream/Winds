import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import { ArticleSchema } from './article';
import { getStreamClient } from '../utils/stream';
import { getUrl } from '../utils/urls';

export const RSSSchema = new Schema(
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
		feedUrls: [String],
		fingerprint: {
			type: String,
			trim: true,
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
			index: true,
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
		followerCount: {
			type: Number,
			default: 0,
		},
		postCount: {
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
		consecutiveScrapeFailures: {
			type: Number,
			default: 0,
		},
	},
	{
		collection: 'rss',
		toJSON: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
				ret.streamToken = getStreamClient()
					.feed('rss', ret._id)
					.getReadOnlyToken();
			},
		},
		toObject: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
				ret.streamToken = getStreamClient()
					.feed('rss', ret._id)
					.getReadOnlyToken();
			},
		},
	},
);

RSSSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});

RSSSchema.statics.incrScrapeFailures = async function(id) {
	await this.findOneAndUpdate(
		{ _id: id },
		{ $inc: { consecutiveScrapeFailures: 1 } },
	).exec();
};

RSSSchema.statics.resetScrapeFailures = async function(id) {
	await this.findOneAndUpdate(
		{ _id: id },
		{ $set: { consecutiveScrapeFailures: 0 } },
	).exec();
};

RSSSchema.methods.getUrl = function() {
	return getUrl('rss_detail', this._id);
};

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

RSSSchema.methods.serialize = function serialize() {
	const serialized = this.toObject();
	serialized.streamToken = getStreamClient()
		.feed('rss', this._id)
		.getReadOnlyToken();
	return serialized;
};

RSSSchema.index({ featured: 1 }, { partialFilterExpression: { featured: true } });

RSSSchema.plugin(mongooseStringQuery);

module.exports = exports = mongoose.model('RSS', RSSSchema);
