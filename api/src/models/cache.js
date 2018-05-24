import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"

export const CacheSchema = new Schema(
    {
        url: {
            type: String,
            trim: true,
            required: true,
        },
        title: {
            type: String,
            trim: true,
            required: true,
        },
        excerpt: {
            type: String,
            trim: true,
            required: true,
        },
        content: {
            type: String,
            trim: true,
            required: true,
        },
        image: {
            type: String,
            trim: true,
        },
        publicationDate: {
            type: Date,
            default: Date.now,
        },
    },
    { collection: "cache" },
)

CacheSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
CacheSchema.plugin(mongooseStringQuery)

module.exports = exports = mongoose.model("Cache", CacheSchema)
