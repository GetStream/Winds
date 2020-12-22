import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import 'crypto';
import { createHash } from 'crypto';
import { EnclosureSchema } from './enclosure';
import Content from './content';
import { ParseContent } from '../parsers/content';
import { getUrl } from '../utils/urls';
import sanitize from '../utils/sanitize';

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
			// maxLength: 240,
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
			transform: function (doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
				ret.type = 'episodes';
			},
		},
		toObject: {
			transform: function (doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
				ret.type = 'episodes';
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
EpisodeSchema.index({ publicationDate: -1 });

EpisodeSchema.methods.getUrl = function () {
	return getUrl('episode_detail', this.podcast._id, this._id);
};

EpisodeSchema.methods.getParsedEpisode = async function () {
	const url = this.url;
	const content = await Content.findOne({ url });
	if (content) return content;

	try {
		const parsed = await ParseContent(url);
		const title = parsed.title || this.title;
		const excerpt = parsed.excerpt || title || this.description;

		if (!title) return null;

		const content = sanitize(parsed.content);
		return await Content.create({
			content,
			title,
			url,
			excerpt,
			image: parsed.lead_image_url || '',
			publicationDate: this.publicationDate || parsed.date_published,
			commentUrl: this.commentUrl,
			enclosures: this.enclosures,
		});
	} catch (e) {
		throw new Error(`Mercury call failed for ${url}: ${e.message}`);
	}
};

module.exports = exports = mongoose.model('Episode', EpisodeSchema);
