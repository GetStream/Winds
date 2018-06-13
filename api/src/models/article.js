import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import Cache from './cache';
import {ParseArticle} from '../parsers/article';
import { createHash } from 'crypto';

export const EnclosureSchema = new Schema({
	url: {
		type: String,
		trim: true,
	},
	type: {
		type: String,
		trim: true,
	},
	length: {
		type: String,
		trim: true,
	},
});

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
		},
		url: {
			type: String,
			trim: true,
			required: true,
			index: true,
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
		valid: {
			type: Boolean,
			default: true,
			valid: true,
		},
		contentHash: {
			type: String,
			default: '',
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

ArticleSchema.index({ rss: 1, url: 1 }, { unique: true });
ArticleSchema.index({ rss: 1, contentHash: 1 }, { unique: true });

ArticleSchema.pre('save', function(next) {
	if(!this.contentHash) {
		this.contentHash = this.computeContentHash();
	}
	next();
});

function computeContentHash(article) {
	const enclosure = article.enclosures && article.enclosures.join(',') || '';
	const data = `${article.title}:${article.description}:${article.content}:${enclosure}`;
	return createHash('md5').update(data).digest('hex');
}

ArticleSchema.statics.computeContentHash = function(article) {
	return computeContentHash(article);
};

ArticleSchema.methods.computeContentHash = function() {
	return computeContentHash(this);
};

ArticleSchema.methods.getParsedArticle = async function() {
	let cached = await Cache.findOne({ url: this.url });
	if (cached) {
		return cached;
	}

 	let response = await ParseArticle(this.url);
	let parsed = response.data;
	let content = parsed.content;

	// XKCD doesn't like Mercury
	if (this.url.indexOf('https://xkcd') === 0) {
		content = this.content;
	}

	cached = await Cache.create({
		content: content,
		excerpt: parsed.excerpt || parsed.title,
		image: parsed.lead_image_url || '',
		publicationDate: parsed.date_published || this.publicationDate,
		title: parsed.title,
		url: this.url,
		commentUrl: this.commentUrl,
		enclosures: this.enclosures,
	});
	return cached;
};

module.exports = exports =  mongoose.model('Article', ArticleSchema);
module.exports.ArticleSchema = ArticleSchema;
