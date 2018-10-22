import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import Cache from './cache';
import { ParseArticle } from '../parsers/article';
import { getUrl } from '../utils/urls';
import sanitize from '../utils/sanitize';

import { createHash } from 'crypto';

import { EnclosureSchema } from './enclosure';

export const ArticleSchema = new Schema(
	{
		rss: {
			type: Schema.Types.ObjectId,
			ref: 'RSS',
			required: true,
			autopopulate: {
				select: [
					'title',
					'url',
					'feedUrl',
					'favicon',
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
			index: true,
		},
		duplicateOf: {
			type: Schema.Types.ObjectId,
			ref: 'Article',
			required: false,
		},
		url: {
			type: String,
			trim: true,
			required: true,
			index: { type: 'hashed' },
		},
		canonicalUrl: {
			type: String,
			trim: true,
		},
		fingerprint: {
			type: String,
			trim: true,
			required: true,
		},
		guid: {
			type: String,
			trim: true,
		},
		link: {
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
			maxLength: 240,
			default: '',
		},
		content: {
			type: String,
			trim: true,
			default: '',
		},
		commentUrl: {
			type: String,
			trim: true,
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
		publicationDate: {
			type: Date,
			default: Date.now,
		},
		enclosures: [EnclosureSchema],
		likes: {
			type: Number,
			default: 0,
		},
		socialScore: {
			reddit: {
				type: Number,
			},
			hackernews: {
				type: Number,
			},
		},
		valid: {
			type: Boolean,
			default: true,
			valid: true,
		},
	},
	{
		collection: 'articles',

		toJSON: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
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
			},
		},
	},
);

ArticleSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
ArticleSchema.plugin(mongooseStringQuery);
ArticleSchema.plugin(autopopulate);

ArticleSchema.index({ rss: 1, fingerprint: 1 }, { unique: true });
ArticleSchema.index({ rss: 1, publicationDate: -1 });

ArticleSchema.methods.getUrl = function() {
	return getUrl('article_detail', this.rss._id, this._id);
};

ArticleSchema.methods.getParsedArticle = async function() {
	let cached = await Cache.findOne({ url: this.url });
	if (cached) {
		return cached;
	}

	let parsed;
	try {
		parsed = await ParseArticle(this.url);
	} catch (e) {
		throw new Error(`Mercury API call failed for ${this.url}: ${e.message}`);
	}
	let content = sanitize(parsed.content);

	// XKCD doesn't like Mercury
	if (this.url.indexOf('https://xkcd') === 0) {
		content = this.content;
	}

	const excerpt = parsed.excerpt || parsed.title || this.description;
	const title = parsed.title || this.title;

	if (!title) {
		return null;
	}

	cached = await Cache.create({
		content: content,
		excerpt: excerpt,
		image: parsed.lead_image_url || '',
		publicationDate: parsed.date_published || this.publicationDate,
		title: title,
		url: this.url,
		commentUrl: this.commentUrl,
		enclosures: this.enclosures,
	});
	return cached;
};

module.exports = exports = mongoose.model('Article', ArticleSchema);
module.exports.ArticleSchema = ArticleSchema;
