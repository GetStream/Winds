import mongoose, { Schema } from "mongoose"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"
import autopopulate from "mongoose-autopopulate"

export const PlaylistSchema = new Schema(
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
                    "background",
                    "admin",
                ],
            },
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        episodes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Episode",
                required: true,
                autopopulate: true,
            },
        ],
        likes: {
            type: Number,
            default: 0,
        },
    },
    { collection: "playlists" },
)

PlaylistSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
PlaylistSchema.plugin(mongooseStringQuery)
PlaylistSchema.plugin(autopopulate)

module.exports = exports = mongoose.model("Playlist", PlaylistSchema)
