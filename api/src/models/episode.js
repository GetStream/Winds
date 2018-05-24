import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const EpisodeSchema = new Schema(
    {
        podcast: {
            type: Schema.Types.ObjectId,
            ref: "Podcast",
            required: true,
            autopopulate: {
                select: [
                    "title",
                    "url",
                    "link",
                    "enclosure",
                    "feedUrl",
                    "image",
                    "categories",
                    "description",
                    "public",
                    "valid",
                    "publicationDate",
                    "lastScraped",
                    "images",
                    "featured",
                ],
            },
        },
        url: {
            type: String,
            trim: true,
            required: true,
            index: true,
        },
        link: {
            type: String,
            trim: true,
            index: true,
        },
        enclosure: {
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
            default: "",
        },
        images: {
            featured: {
                type: String,
                trim: true,
                default: "",
            },
            banner: {
                type: String,
                trim: true,
                default: "",
            },
            favicon: {
                type: String,
                trim: true,
                default: "",
            },
            og: {
                type: String,
                trim: true,
                default: "",
            },
        },
        duration: {
            type: String,
            default: "",
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
    { collection: "episodes" },
)

EpisodeSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
EpisodeSchema.plugin(mongooseStringQuery)
EpisodeSchema.plugin(autopopulate)

EpisodeSchema.index({ podcast: 1, url: 1 })

module.exports = exports = mongoose.model("Episode", EpisodeSchema)
