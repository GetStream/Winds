import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import 'crypto';
import { createHash } from 'crypto';
import { EnclosureSchema } from './enclosure';
import Cache from './cache';
import { ParseArticle } from '../parsers/article';

export const EpisodeSchema = new Schema(
	{
		podcast: {
			type: Schema.Types.ObjectId,
			ref: 'Podcast',
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
					'duplicateOf',
				],
			},
		},
		duplicateOf: {
			type: Schema.Types.ObjectId,
			ref: 'Episode',
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
			index: { type: 'hashed' },
		},
		enclosure: {
			type: String,
			trim: true,
		},
		enclosures: [EnclosureSchema],
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
	{
		collection: 'episodes',
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

EpisodeSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
EpisodeSchema.plugin(mongooseStringQuery);
EpisodeSchema.plugin(autopopulate);

EpisodeSchema.index({ podcast: 1, fingerprint: 1 }, { unique: true });
EpisodeSchema.index({ podcast: 1, publicationDate: -1 });

EpisodeSchema.methods.getParsedEpisode = async function() {
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
	let content = parsed.content;

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

module.exports = exports = mongoose.model('Episode', EpisodeSchema);
