import stream from "getstream"
import async from "async"

import Follow from "../models/follow"
import User from "../models/user"

import config from "../config"
import email from "../utils/email"
import logger from "../utils/logger"
import followRssFeed from "../shared/followRssFeed"
import followPodcast from "../shared/followPodcast"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

exports.list = (req, res) => {
    if (req.query.type === "rss") {
        Follow.find({ user: req.user.sub })
            .where("rss")
            .exists()
            .then(results => {
                res.json(results)
            })
    } else if (req.query.type === "podcast") {
        Follow.find({ user: req.user.sub })
            .where("podcast")
            .exists()
            .then(results => {
                res.json(results)
            })
    } else {
        Follow.apiQuery(req.query)
            .then(follows => {
                res.json(follows)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}

exports.get = (req, res) => {
    if (req.params.followId === "undefined") {
        return res.sendStatus(404)
    }

    Follow.findById(req.params.followId)
        .then(follow => {
            if (!follow) {
                return res.sendStatus(404)
            }
            res.json(follow)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const query = req.query || {}
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    if (!query.type) {
        return res.status(422).send("Missing required type query parameter.")
    }

    if (query.type === "user") {
        let obj = { followee: data.followee, user: data.user }

        async.waterfall(
            [
                cb => {
                    Follow.findOne(obj)
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
                    Follow.create(obj)
                        .then(follow => {
                            cb(null, follow)
                        })
                        .catch(() => {
                            cb(null)
                        })
                },
                (follow, cb) => {
                    client
                        .feed("timeline", data.user)
                        .follow("user", data.followee)
                        .then(follow => {
                            cb(null, follow)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (follow, cb) => {
                    User.findById(data.followee)
                        .then(followee => {
                            cb(null, follow, followee)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (follow, followee, cb) => {
                    User.findById(data.user)
                        .then(follower => {
                            cb(null, follow, followee, follower)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (follow, followee, follower, cb) => {
                    email({
                        email: followee.email,
                        follower: follower.username,
                        followerId: follower._id,
                        type: "followee",
                    })
                        .then(() => {
                            cb(null, follow, followee, follower)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
            ],
            err => {
                if (err) {
                    logger.error(err)
                    return res.status(422).send(err.errors)
                }
                res.sendStatus(200)
            },
        )
    } else if (query.type === "podcast") {
        followPodcast(data.user, query.podcast)
            .then(followRelationship => {
                res.json(followRelationship)
            })
            .catch(err => {
                logger.error(err)
                res.status(500).send(err)
            })
    } else if (query.type === "rss") {
        followRssFeed(data.user, query.rss)
            .then(followRelationship => {
                res.json(followRelationship)
            })
            .catch(err => {
                logger.error(err)
                res.status(500).send(err)
            })
    }
}

exports.delete = (req, res) => {
    const query = req.query || {}
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    if (query.type === "podcast") {
        Follow.remove({
            podcast: query.podcast,
            user: data.user,
        })
            .then(() => {
                return Promise.all([
                    client.feed("user_episode", data.user).unfollow("podcast", query.podcast),
                    client.feed("timeline", data.user).unfollow("podcast", query.podcast),
                ])
            })
            .then(() => {
                res.status(204).send()
            })
            .catch(err => {
                logger.error(err)
                return res.status(422).send(err)
            })
    } else if (query.type === "rss") {
        Follow.remove({
            rss: query.rss,
            user: data.user,
        })
            .then(() => {
                return Promise.all([
                    client.feed("user_article", data.user).unfollow("rss", query.rss),
                    client.feed("timeline", data.user).unfollow("rss", query.rss),
                ])
            })
            .then(() => {
                res.status(204).send()
            })
            .catch(err => {
                logger.error(err)
                return res.status(422).send(err)
            })
    } else if (query.type === "user") {
        Follow.remove({
            followee: query.followee,
            user: data.user,
        })
            .then(() => {
                return client.feed("timeline", data.user).unfollow("user", query.followee)
            })
            .then(() => {
                res.status(204).send() // 204 is no content, so not sending a response body.
            })
            .catch(err => {
                if (err) {
                    logger.error(err)
                    return res.status(422).send(err.errors)
                }
            })
    } else {
        res.sendStatus(422)
    }
}
