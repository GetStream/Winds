import mongoose, { Schema } from "mongoose"
import bcrypt from "mongoose-bcrypt"
import timestamps from "mongoose-timestamp"
import mongooseStringQuery from "mongoose-string-query"

import logger from "../utils/logger"
import email from "../utils/email"

export const UserSchema = new Schema(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
            required: true,
        },
        username: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
            bcrypt: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        bio: {
            type: String,
            trim: true,
            default: "",
        },
        url: {
            type: String,
            trim: true,
            default: "",
        },
        twitter: {
            type: String,
            trim: true,
            default: "",
        },
        background: {
            type: Number,
            default: 1,
        },
        interests: {
            type: Schema.Types.Mixed,
            default: [],
        },
        preferences: {
            notifications: {
                daily: {
                    type: Boolean,
                    default: false,
                },
                weekly: {
                    type: Boolean,
                    default: true,
                },
                follows: {
                    type: Boolean,
                    default: true,
                },
            },
        },
        recoveryCode: {
            type: String,
            trim: true,
            default: "",
        },
        active: {
            type: Boolean,
            default: true,
        },
        admin: {
            type: Boolean,
            default: false,
        },
    },
    { collection: "users" },
)

UserSchema.pre("save", function(next) {
    if (!this.isNew) {
        next()
    }

    email({
        email: this.email,
        type: "welcome",
    })
        .then(() => {
            next()
        })
        .catch(err => {
            logger.error(err)
            next()
        })
})

UserSchema.pre("findOneAndUpdate", function(next) {
    if (!this._update.recoveryCode) {
        return next()
    }

    email({
        email: this._conditions.email,
        passcode: this._update.recoveryCode,
        type: "password",
    })
        .then(() => {
            next()
        })
        .catch(err => {
            logger.error(err)
            next()
        })
})

UserSchema.plugin(bcrypt)
UserSchema.plugin(timestamps, {
    createdAt: { index: true },
    updatedAt: { index: true },
})
UserSchema.plugin(mongooseStringQuery)

UserSchema.index({ email: 1, username: 1 })

module.exports = exports = mongoose.model("User", UserSchema)
