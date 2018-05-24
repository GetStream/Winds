import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const ArticleSchema = new Schema(
    {
        rss: {
            type: Schema.Types.ObjectId,
            ref: "RSS",
            required: true,
            autopopulate: {
                select: [
                    "title",
                    "url",
                    "feedUrl",
                    "favicon",
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
        content: {
            type: String,
            trim: true,
            default: "",
        },
        commentUrl: {
            type: String,
            trim: true,
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
            valid: true,
        },
    },
    { collection: "articles" },
)

ArticleSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
ArticleSchema.plugin(mongooseStringQuery)
ArticleSchema.plugin(autopopulate)

ArticleSchema.index({ rss: 1, url: 1 })

module.exports = exports = mongoose.model("Article", ArticleSchema)
