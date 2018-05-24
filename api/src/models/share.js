import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const ShareSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            required: true,
            autopopulate: {
                select: [
                    "name",
                    "email",
                    "username",
                    "bio",
                    "url",
                    "twitter",
                    "background",
                    "admin",
                ],
            },
        },
        text: {
            type: String,
            trim: true,
            default: "",
        },
        share: {
            type: Schema.Types.ObjectId,
            ref: "Share",
            autopopulate: true,
        },
        article: {
            type: Schema.Types.ObjectId,
            ref: "Article",
            autopopulate: {
                select: ["parent", "url", "title", "description", "image", "publictionDate"],
            },
        },
        episode: {
            type: Schema.Types.ObjectId,
            ref: "Episode",
            autopopulate: {
                select: ["parent", "url", "title", "description", "image", "publictionDate"],
            },
        },
        flags: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Number,
            default: 0,
        },
    },
    { collection: "shares" },
)

ShareSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
ShareSchema.plugin(mongooseStringQuery)
ShareSchema.plugin(autopopulate)

module.exports = exports = mongoose.model("Share", ShareSchema)
