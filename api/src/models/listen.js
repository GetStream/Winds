import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const ListenSchema = new Schema(
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
        episode: {
            type: Schema.Types.ObjectId,
            ref: "Episode",
            autopopulate: {
                select: ["parent", "url", "title", "description", "image", "publictionDate"],
            },
            required: true,
        },
        duration: {
            type: Number,
            default: 0,
            required: true,
        },
    },
    { collection: "listens" },
)

ListenSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
ListenSchema.plugin(mongooseStringQuery)
ListenSchema.plugin(autopopulate)

module.exports = exports = mongoose.model("Listen", ListenSchema)
