import async from "async"

import Episode from "../models/episode"
import User from "../models/user"
import Like from "../models/like"

import logger from "../utils/logger"
import events from "../utils/events"
import personalization from "../utils/personalization"

exports.list = (req, res) => {
    const query = req.query || {}

    if (query.type === "recommended") {
        personalization({
            userId: req.user.sub,
            endpoint: "/winds_episode_recommendations",
        })
            .then(data => {
                async.mapLimit(
                    data,
                    data.length,
                    (episode, cb) => {
                        Episode.findOne({ _id: episode })
                            .then(enriched => {
                                if (!enriched) {
                                    return cb(null)
                                }

                                Like.findOne({
                                    article: enriched._id,
                                    user: req.user.sub,
                                })
                                    .lean()
                                    .then(like => {
                                        enriched = enriched.toObject()

                                        if (like) {
                                            enriched.liked = true
                                        } else {
                                            enriched.liked = false
                                        }

                                        cb(null, enriched)
                                    })
                                    .catch(err => {
                                        cb(err)
                                    })
                            })
                            .catch(err => {
                                cb(err)
                            })
                    },
                    (err, results) => {
                        if (err) {
                            logger.error(err)
                            return res.sendStatus(422)
                        }

                        res.json(
                            [].concat(
                                ...results.filter(val => {
                                    return val
                                }),
                            ),
                        )
                    },
                )
            })
            .catch(err => {
                res.sendStatus(503)
            })
    } else {
        Episode.apiQuery(req.query)
            .then(episodes => {
                async.mapLimit(
                    episodes,
                    episodes.length,
                    (episode, cb) => {
                        Like.findOne({ episode: episode._id, user: req.user.sub })
                            .lean()
                            .then(like => {
                                episode = episode.toObject()

                                if (like) {
                                    episode.liked = true
                                } else {
                                    episode.liked = false
                                }

                                cb(null, episode)
                            })
                            .catch(err => {
                                cb(err)
                            })
                    },
                    (err, results) => {
                        if (err) {
                            logger.error(err)
                            return res.status(422).send(err.errors)
                        }
                        res.json(results.filter(result => result.valid))
                    },
                )
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}

exports.get = (req, res) => {
    if (req.params.episodeId == "undefined") {
        return res.sendStatus(404)
    }

    let page = 0
    let perPage = 25

    async.waterfall(
        [
            cb => {
                Episode.findById(req.params.episodeId)
                    .skip(perPage * page)
                    .limit(perPage)
                    .then(episode => {
                        if (!episode) {
                            return res.sendStatus(404)
                        }
                        cb(null, episode)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (episode, cb) => {
                User.findById(req.user.sub)
                    .then(user => {
                        if (!user) {
                            return res.sendStatus(404)
                        }
                        cb(null, episode, user)
                    })
                    .catch(err => {
                        cb(err)
                    })
            },
            (episode, user, cb) => {
                events({
                    user: user._id,
                    email: user.email.toLowerCase(),
                    impression: {
                        label: "view",
                        content_list: [
                            {
                                foreign_id: `episode:${episode._id}`,
                            },
                        ],
                    },
                })
                    .then(() => {
                        res.json(episode)
                    })
                    .catch(err => {
                        logger.error(err)
                        res.sendStatus(503)
                    })
            },
            (episode, user, cb) => {
                let obj = {
                    meta: {
                        data: {},
                    },
                }

                obj.meta.data[`episode:${this._id}`] = {
                    title: this.title,
                    description: this.description,
                }

                events(obj)
                    .then(() => {
                        cb(null, episode, user)
                    })
                    .catch(err => {
                        cb(null)
                    })
            },
        ],
        (err, result) => {
            if (err) {
                logger.error(err)
                res.status(422).send(err.errors)
            }
            res.json(results)
        },
    )
}
