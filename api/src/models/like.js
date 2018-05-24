import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const LikeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            autopopulate: {
                select: [
                    "name",
                    "email",
                    "username",
                    "bio",
                    "url",
                    "twitter",
                    "preferences",
                    "background",
                    "admin",
                ],
            },
        },
        share: {
            type: Schema.Types.ObjectId,
            ref: "Share",
            autopopulate: {
                select: ["author", "article", "episode", "text", "flags"],
            },
        },
        rss: {
            type: Schema.Types.ObjectId,
            ref: "RSS",
            autopopulate: {
                select: [
                    "url",
                    "feedUrl",
                    "title",
                    "favicon",
                    "description",
                    "categories",
                    "public",
                    "publicationDate",
                    "images",
                ],
            },
        },
        article: {
            type: Schema.Types.ObjectId,
            ref: "Article",
            autopopulate: {
                select: ["rss", "url", "title", "description", "image", "publictionDate"],
            },
        },
        podcast: {
            type: Schema.Types.ObjectId,
            ref: "Podcast",
            autopopulate: {
                select: [
                    "url",
                    "feedUrl",
                    "title",
                    "description",
                    "categories",
                    "images",
                    "public",
                    "publicationDate",
                ],
            },
        },
        episode: {
            type: Schema.Types.ObjectId,
            ref: "Episode",
            autopopulate: {
                select: ["article", "url", "title", "description", "image", "publictionDate"],
            },
        },
        playlist: {
            type: Schema.Types.ObjectId,
            ref: "Playlist",
            autopopulate: {
                select: ["user", "name", "episodes"],
            },
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            autopopulate: {
                select: ["user", "text"],
            },
        },
    },
    { collection: "likes" },
)

LikeSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
LikeSchema.plugin(mongooseStringQuery)
LikeSchema.plugin(autopopulate)

module.exports = exports = mongoose.model("Like", LikeSchema)
