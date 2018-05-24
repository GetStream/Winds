import async from "async"
import validator from "validator"

import User from "../models/user"
import RSS from "../models/rss"
import Podcast from "../models/podcast"

import logger from "../utils/logger"
import personalization from "../utils/personalization"

import followRssFeed from "../shared/followRssFeed"
import followPodcast from "../shared/followPodcast"

exports.list = (req, res) => {
    const params = req.params || {}
    const query = req.query || {}

    const page = parseInt(query.page, 10) || 0
    const perPage = parseInt(query.per_page, 10) || 10

    if (query.type === "recommended") {
        personalization({
            endpoint: "/winds_user_recommendations",
            userId: req.user.sub,
        })
            .then(users => {
                if (!users.length) {
                    return res.status(200).json([])
                }
                async.filter(
                    users,
                    (user, cb) => {
                        User.findOne({ _id: user, active: true })
                            .then(user => {
                                if (user) {
                                    cb(null, true)
                                } else {
                                    cb(null)
                                }
                            })
                            .catch(err => {
                                cb(err)
                            })
                    },
                    (err, results) => {
                        async.map(
                            results,
                            (user, cb) => {
                                User.findOne({ _id: user, active: true })
                                    .select(
                                        "name username email interests background url bio twitter",
                                    )
                                    .then(enriched => {
                                        cb(null, enriched)
                                    })
                                    .catch(err => {
                                        cb(err)
                                    })
                            },
                            (err, results) => {
                                if (err) {
                                    logger.error(err)
                                    return res.status(422).send(err)
                                } else {
                                    res.json(results)
                                }
                            },
                        )
                    },
                )
            })
            .catch(err => {
                res.status(503).send(err.response.data)
            })
    } else {
        User.apiQuery(req.query)
            .select("name email username bio url twitter background admin")
            .then(users => {
                res.json(users)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}

exports.get = (req, res) => {
    if (req.params.user == "undefined") {
        return res.sendStatus(404)
    }

    User.findById(req.params.userId)
        .then(user => {
            if (!user) {
                res.status(404).send("User not found")
            } else {
                user.password = undefined
                user.recoveryCode = undefined

                res.json(user)
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.put = (req, res) => {
    if (req.params.userId !== req.user.sub) {
        return res.status(401).send()
    }

    const data = req.body || {}

    if (data.email && !validator.isEmail(data.email)) {
        return res.status(422).send("Invalid email address.")
    }

    if (data.username && !validator.isAlphanumeric(data.username)) {
        return res.status(422).send("Usernames must be alphanumeric.")
    }

    // TODO: go back in and clean this up (@kenhoff)
    // first, check to see if the user exists.
    User.findById(req.params.userId)
        .then(user => {
            if (!user) {
                return res.sendStatus(404)
            } else {
                // (this gets a little wonky, just because we have to verify the user exists before trying to set all the follow relationship stuff, and we also want to only do the following if they pass in interests as part of the PUT request)
                // if you know of a better way to make this one work, feel free to refactor!
                return new Promise(resolve => {
                    if (data.interests) {
                        // then, if interests are provided as part of the PUT request - if so, go through and follow all the rss feeds / podcasts listed under each one of the interests
                        // (in the future, can do a quick diff to see if some of the interests are previous interests, or if the rss feeds / podcasts have already been followed - but for now, just refollow all the "interest" rss feeds / podcasts if the "interests" key is provided)

                        // for each "interest" provided:
                        return Promise.all([
                            data.interests.map(interest => {
                                // find all rss feeds and podcasts for that interest, and follow them
                                return Promise.all([
                                    RSS.find({ interest }).then(rssFeeds => {
                                        return Promise.all(
                                            rssFeeds.map(rssFeed => {
                                                return followRssFeed(req.params.userId, rssFeed._id)
                                            }),
                                        )
                                    }),
                                    Podcast.find({ interest }).then(podcasts => {
                                        return Promise.all(
                                            podcasts.map(podcast => {
                                                return followPodcast(req.params.userId, podcast._id)
                                            }),
                                        )
                                    }),
                                ])
                            }),
                        ]).then(() => {
                            resolve()
                        })
                    } else {
                        resolve()
                    }
                }).then(() => {
                    // update the user
                    User.findByIdAndUpdate({ _id: req.params.userId }, data, {
                        new: true,
                    }).then(user => {
                        // send back the user
                        user.password = undefined
                        user.recoveryCode = undefined

                        return res.json(user)
                    })
                })
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(500).send(err)
        })
}
