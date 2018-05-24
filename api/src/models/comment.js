import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const CommentSchema = new Schema(
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
        text: {
            type: String,
            trim: true,
            required: true,
        },
        flags: {
            type: Number,
            default: 0,
        },
    },
    { collection: "comments" },
)

CommentSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
CommentSchema.plugin(mongooseStringQuery)
CommentSchema.plugin(autopopulate)

module.exports = exports = mongoose.model("Comment", CommentSchema)
