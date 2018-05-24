import mongoose from "mongoose"
import async from "async"
import stream from "getstream"

import Like from "../models/like"
import Podcast from "../models/podcast"
import Episode from "../models/episode"
import RSS from "../models/rss"
import Playlist from "../models/playlist"
import Share from "../models/share"

import config from "../config"
import logger from "../utils/logger"
import events from "../utils/events"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

exports.list = (req, res) => {
    Like.apiQuery(req.query)
        .then(likes => {
            if (!likes) {
                return res.sendStatus(404)
            }
            res.json(likes)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.get = (req, res) => {
    if (req.params.likeId == "undefined") {
        return res.sendStatus(404)
    }

    Like.findById(req.params.likeId)
        .then(like => {
            if (!like) {
                return res.sendStatus(404)
            }
            res.json(like)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    let type
    const types = ["podcast", "episode", "rss", "article", "playlist", "share", "comment"]
    types.map(key => {
        if (data.hasOwnProperty(key)) {
            type = key
        }
    })

    let obj = { user: data.user }
    obj[type] = data[type]

    async.waterfall(
        [
            cb => {
                Like.findOne(data)
                    .then(exists => {
                        if (exists) {
                            return res.sendStatus(409)
                        }
                        cb(null)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            cb => {
                Like.create(data)
                    .then(like => {
                        cb(null, like)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (like, cb) => {
                mongoose
                    .model(type.charAt(0).toUpperCase() + type.slice(1))
                    .findByIdAndUpdate(
                        {
                            _id: data[type],
                        },
                        { $inc: { likes: 1 } },
                        { upsert: false, new: false },
                    )
                    .then(update => {
                        cb(null, like)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (like, cb) => {
                Like.findById(like._id)
                    .then(like => {
                        cb(null, like)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (like, cb) => {
                client
                    .feed("user", like.user._id)
                    .addActivity({
                        actor: like.user._id,
                        verb: "like",
                        object: like._id,
                        foreign_id: `likes:${like._id}`,
                        time: like.createdAt,
                    })
                    .then(() => {
                        cb(null, like)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (like, cb) => {
                events({
                    user: like.user._id,
                    email: like.user.email.toLowerCase(),
                    engagement: {
                        label: "like",
                        content: {
                            foreign_id: `${type}:${like[type]._id}`,
                        },
                    },
                })
                    .then(() => {
                        cb(null, like)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
        ],
        (err, like) => {
            if (err) {
                logger.error(err)
                return res.sendStatus(409)
            }
            res.sendStatus(201)
        },
    )
}

exports.delete = (req, res) => {
    const query = req.query || {}

    const type = Object.keys(query)[0]
    const value = Object.values(query)[0]

    let obj = {}
    obj[type] = value
    let model = type.charAt(0).toUpperCase() + type.slice(1)
    if (model.charAt(model.length - 1) == "s") {
        model.slice(0, -1)
    }

    Like.findOneAndRemove(Object.assign({}, obj, { user: req.user.sub }))
        .then(() => {
            mongoose
                .model(model)
                .findByIdAndUpdate(
                    {
                        _id: value,
                    },
                    { $inc: { likes: -1 } },
                    { upsert: false, new: false },
                )
                .then(() => {
                    res.sendStatus(204)
                })
                .catch(err => {
                    logger.error(err)
                    return res.status(500).send(err.errors)
                })
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
