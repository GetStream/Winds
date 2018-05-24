import stream from "getstream"
import async from "async"

import Share from "../models/share"
import Article from "../models/article"
import Episode from "../models/episode"
import Like from "../models/like"

import config from "../config"
import logger from "../utils/logger"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

exports.get = (req, res) => {
    const params = req.params || {}
    const query = req.query || {}

    const q = { user: params.userId }

    if (query.type === "user") {
        async.parallel(
            [
                cb => {
                    Share.find(Object.assign({}, q, { flags: { $lte: 5 } }))
                        .sort({ createdAt: "desc" })
                        .then(shares => {
                            async.mapLimit(
                                shares,
                                shares.length,
                                (share, cb) => {
                                    Like.findOne({
                                        share: share._id,
                                        user: params.userId,
                                    })
                                        .lean()
                                        .then(like => {
                                            share = share.toObject()
                                            if (like) {
                                                share.liked = true
                                            } else {
                                                share.liked = false
                                            }
                                            share.type = "share"
                                            cb(null, share)
                                        })
                                        .catch(err => {
                                            cb(err)
                                        })
                                },
                                (err, results) => {
                                    if (err) {
                                        return cb(err)
                                    }
                                    cb(null, results)
                                },
                            )
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
            ],
            (err, results) => {
                if (err) {
                    logger.error(err)
                    return res.status(422).send(err.errors)
                }

                res.json(
                    [].concat(
                        ...results[0].filter(val => {
                            return val
                        }),
                    ),
                )
            },
        )
    } else if (query.type === "timeline") {
        let shares = []
        let episodes = []
        let articles = []

        client
            .feed("timeline", params.userId)
            .get({ limit: 10 })
            .then(activities => {
                async.mapLimit(
                    activities.results,
                    activities.results.length,
                    (activity, cb) => {
                        let id = activity.foreign_id.split(":")[1]
                        let collection = activity.foreign_id.split(":")[0]

                        if (collection === "shares") {
                            Share.findById(id)
                                .then(share => {
                                    if (!share) {
                                        return cb(null)
                                    }

                                    share = share.toObject()
                                    share.type = "share"

                                    Like.findOne({
                                        share: share._id,
                                        user: params.userId,
                                    })
                                        .lean()
                                        .then(like => {
                                            if (like) {
                                                share.liked = true
                                            } else {
                                                share.liked = false
                                            }

                                            shares.push(share)
                                            cb(null)
                                        })
                                        .catch(err => {
                                            cb(err)
                                        })
                                })
                                .catch(err => {
                                    cb(err)
                                })
                        } else if (collection === "articles") {
                            Article.findById(id)
                                .then(article => {
                                    if (!article) {
                                        return cb(null)
                                    }

                                    article = article.toObject()
                                    article.type = "article"

                                    articles.push(article)
                                    cb(null)
                                })
                                .catch(err => {
                                    cb(err)
                                })
                        } else if (collection === "episodes") {
                            Episode.findById(id)
                                .then(episode => {
                                    if (!episode) {
                                        return cb(null)
                                    }

                                    episode = episode.toObject()
                                    episode.type = "episode"

                                    episodes.push(episode)
                                    cb(null)
                                })
                                .catch(err => {
                                    cb(err)
                                })
                        } else {
                            cb(null)
                        }
                    },
                    err => {
                        if (err) {
                            logger.error(err)
                            return res.status(422).send(err.errors)
                        }

                        const timeline = [
                            [].concat(
                                ...shares.filter(val => {
                                    return val
                                }),
                            ),
                            [].concat(
                                ...articles.filter(val => {
                                    return val
                                }),
                            ),
                            [].concat(
                                ...episodes.filter(val => {
                                    return val
                                }),
                            ),
                        ]

                        const merged = [].concat(timeline[0], timeline[1], timeline[2])
                        const sorted = merged.sort((a, b) => {
                            return b.createdAt - a.createdAt
                        })

                        res.json(sorted)
                    },
                )
            })
            .catch(err => {
                logger.error(err)
                res.status(500).send(err)
            })
    } else if (query.type === "article") {
        let limit = query.per_page || 10
        let offset = query.page * limit || 0
        client
            .feed("user_article", params.userId)
            .get({ limit, offset })
            .then(response => {
                return Promise.all(
                    response.results.map(activity => {
                        return Article.findById(activity.foreign_id.split(":")[1])
                    }),
                )
            })
            .then(enriched => {
                res.json(enriched)
            })
            .catch(err => {
                logger.error(err)
                res.status(500).send(err)
            })
    } else if (query.type === "episode") {
        let limit = query.per_page || 10
        let offset = query.page * limit || 0

        client
            .feed("user_episode", params.userId)
            .get({ limit, offset })
            .then(response => {
                return Promise.all(
                    response.results.map(activity => {
                        return Episode.findById(activity.foreign_id.split(":")[1])
                    }),
                )
            })
            .then(enrichedEpisodes => {
                res.json(enrichedEpisodes)
            })
            .catch(err => {
                logger.error(err)
                res.status(500).send(err)
            })
    } else {
        res.status(400).send('Request must include "type" of user, timeline, article or episode')
    }
}
