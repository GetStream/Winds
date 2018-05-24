import async from "async"
import moment from "moment"

import Article from "../models/article"
import User from "../models/user"
import Like from "../models/like"
import Cache from "../models/cache"

import config from "../config"

import logger from "../utils/logger"
import parser from "../utils/parser"
import events from "../utils/events"
import search from "../utils/search"
import personalization from "../utils/personalization"

exports.list = (req, res) => {
    const query = req.query || {}

    if (query.type === "recommended") {
        personalization({
            endpoint: "/winds_article_recommendations",
            userId: req.user.sub,
        })
            .then(data => {
                async.mapLimit(
                    data,
                    data.length,
                    (article, cb) => {
                        Article.findOne({ _id: article })
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
                res.status(503).send(err)
            })
    } else {
        Article.apiQuery(req.query)
            .then(articles => {
                async.mapLimit(
                    articles,
                    articles.length,
                    (article, cb) => {
                        Like.findOne({ article: article._id, user: req.user.sub })
                            .lean()
                            .then(like => {
                                article = article.toObject()

                                if (like) {
                                    article.liked = true
                                } else {
                                    article.liked = false
                                }

                                cb(null, article)
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
    if (req.params.articleId === "undefined") {
        return res.sendStatus(404)
    }

    let query = req.query || {}

    if (query.type === "parsed") {
        async.waterfall(
            [
                cb => {
                    Article.findById(req.params.articleId)
                        .then(article => {
                            if (!article) {
                                return res.sendStatus(404)
                            }
                            cb(null, article)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (article, cb) => {
                    User.findById(req.user.sub)
                        .then(user => {
                            if (!user) {
                                return res.sendStatus(404)
                            }
                            cb(null, article, user)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (article, user, cb) => {
                    events({
                        email: user.email.toLowerCase(),
                        engagement: {
                            content: {
                                foreign_id: `articles:${article._id}`,
                            },
                            label: "parse",
                        },
                        user: user._id,
                    })
                        .then(() => {
                            cb(null, article)
                        })
                        .catch(err => {
                            logger.error(err)
                            cb(err)
                        })
                },
                (article, cb) => {
                    Cache.findOne({ url: article.url })
                        .then(cached => {
                            if (cached) {
                                return cb(null, cached)
                            }
                            parser({ url: article.url })
                                .then(parsed => {
                                    let content = parsed.content
                                    // XKCD doesn't like Mercury
                                    if (article.url.indexOf("https://xkcd") == 0) {
                                        content = article.content
                                    }

                                    Cache.create({
                                        content: content,
                                        excerpt: parsed.excerpt,
                                        image: parsed.lead_image_url || "",
                                        publicationDate: parsed.date_published || moment().toDate(),
                                        title: parsed.title,
                                        url: article.url,
                                        commentUrl: article.commentUrl,
                                    })
                                        .then(cache => {
                                            cb(null, cache)
                                        })
                                        .catch(err => {
                                            logger.error(err)
                                            cb(err)
                                        })
                                })
                                .catch(() => {
                                    Article.findById(article._id).then(article => {
                                        article.valid = false
                                        article.save(function(err) {
                                            if (err) {
                                                logger.error(err)
                                                return cb(err)
                                            }
                                            cb(err)
                                        })
                                    })
                                })
                        })
                        .catch(err => {
                            logger.error(err)
                            res.sendStatus(503)
                        })
                },
            ],
            (err, parsed) => {
                if (err) {
                    logger.error(err)
                    return res.status(422).send(err.errors)
                }
                res.json(parsed)
            },
        )
    } else {
        async.waterfall(
            [
                cb => {
                    Article.findById(req.params.articleId)
                        .then(article => {
                            if (!article) {
                                return res.sendStatus(404)
                            }
                            cb(null, article)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (article, cb) => {
                    User.findById(req.user.sub)
                        .then(user => {
                            cb(null, article, user)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
                (article, user, cb) => {
                    events({
                        email: user.email.toLowerCase(),
                        impression: {
                            content_list: [
                                {
                                    foreign_id: `articles:${article.id}`,
                                },
                            ],
                            label: "view",
                        },
                        user: user._id,
                    })
                        .then(() => {
                            cb(null, article)
                        })
                        .catch(err => {
                            cb(err)
                        })
                },
            ],
            (err, article) => {
                if (err) {
                    logger.error(err)
                    res.status(422).send(err.errors)
                }
                res.json(article)
            },
        )
    }
}
