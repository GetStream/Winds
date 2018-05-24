import async from "async"
import podcastFinder from "rss-finder"
import normalizeUrl from "normalize-url"
import validUrl from "valid-url"

import Podcast from "../models/podcast"
import User from "../models/user"

import personalization from "../utils/personalization"
import logger from "../utils/logger"
import search from "../utils/search"
import config from "../config"
import { ParsePodcast } from "../workers/parsers"
import strip from "strip"

import async_tasks from "../async_tasks"

exports.list = (req, res) => {
    let query = req.query || {}

    if (query.type === "recommended") {
        personalization({
            endpoint: "/winds_podcast_recommendations",
            userId: req.user.sub,
        })
            .then(podcastIDs => {
                return Promise.all(
                    podcastIDs.map(podcastID => {
                        return Podcast.findOne({ _id: podcastID })
                    }),
                )
            })
            .then(results => {
                results = results.filter(podcast => {
                    return podcast
                })
                res.json(results)
            })
            .catch(err => {
                res.status(500).send(err)
            })
    } else {
        Podcast.apiQuery(req.query)
            .then(podcasts => {
                res.json(podcasts)
            })
            .catch(err => {
                logger.error(err)
                res.status(422).send(err.errors)
            })
    }
}

exports.get = (req, res) => {
    if (req.params.podcastId === "undefined") {
        return res.sendStatus(404)
    }

    Podcast.findById(req.params.podcastId)
        .then(podcast => {
            if (!podcast) {
                return res.sendStatus(404)
            }
            res.json(podcast)
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const data = Object.assign(req.body, { user: req.user.sub }) || {}

    if (!data.feedUrl || !validUrl.isUri(normalizeUrl(data.feedUrl))) {
        return res.status(400).send("Please provide a valid podcast URL.")
    }

    podcastFinder(normalizeUrl(data.feedUrl))
        .then(feeds => {
            if (!feeds.feedUrls.length) {
                return res.sendStatus(404)
            }

            async.mapLimit(
                feeds.feedUrls,
                feeds.feedUrls.length,
                (feed, cb) => {
                    // Get more metadata
                    ParsePodcast(feed.url, function(err, podcastContents) {
                        let title, url, images, description
                        if (podcastContents) {
                            title = strip(podcastContents.title) || strip(feed.title)
                            url = podcastContents.link || feeds.site.url
                            images = {
                                favicon: feeds.site.favicon,
                                og: podcastContents.image,
                            }
                            description = podcastContents.description
                        } else {
                            title = strip(feed.title)
                            url = feeds.site.url
                            images = { favicon: feeds.site.favicon }
                            description = ""
                        }

                        Podcast.findOneAndUpdate(
                            { feedUrl: feed.url },
                            {
                                categories: "podcast",
                                description: description,
                                feedUrl: feed.url,
                                images: images,
                                lastScraped: new Date(0),
                                title: title,
                                url: normalizeUrl(url),
                                valid: true,
                            },
                            {
                                new: true,
                                rawResult: true,
                                upsert: true,
                            },
                        )
                            .then(podcast => {
                                if (podcast.lastErrorObject.updatedExisting) {
                                    cb(null, podcast.value)
                                } else {
                                    search({
                                        _id: podcast.value._id,
                                        categories: "Podcast",
                                        description: podcast.value.title,
                                        image: podcast.value.image,
                                        public: true,
                                        publicationDate: podcast.value.publicationDate,
                                        title: podcast.value.title,
                                        type: "podcast",
                                    })
                                        .then(() => {
                                            return async_tasks.PodcastQueueAdd(
                                                {
                                                    podcast: podcast.value._id,
                                                    url: podcast.value.feedUrl,
                                                },
                                                {
                                                    priority: 1,
                                                    removeOnComplete: true,
                                                    removeOnFail: true,
                                                },
                                            )
                                        })
                                        .then(() => {
                                            logger.info(
                                                `api is scheduling ${
                                                    podcast.value.url
                                                } for og scraping`,
                                            )
                                            if (!podcast.value.images.og && podcast.value.link) {
                                                async_tasks
                                                    .OgQueueAdd(
                                                        {
                                                            url: podcast.value.url,
                                                            type: "podcast",
                                                        },
                                                        {
                                                            removeOnComplete: true,
                                                            removeOnFail: true,
                                                        },
                                                    )
                                                    .then(() => {
                                                        cb(null, podcast.value)
                                                    })
                                            } else {
                                                cb(null, podcast.value)
                                            }
                                        })
                                        .catch(err => {
                                            cb(err)
                                        })
                                }
                            })
                            .catch(err => {
                                cb(err)
                            })
                    })
                },
                (err, results) => {
                    if (err) {
                        return
                    }

                    res.json(results)
                },
            )
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err)
        })
}

exports.put = (req, res) => {
    User.findById(req.user.sub)
        .then(user => {
            if (!user.admin) {
                return res.send(401).send()
            } else {
                const data = req.body || {}
                let opts = {
                    new: true,
                }

                return Podcast.findByIdAndUpdate({ _id: req.params.podcastId }, data, opts).then(
                    podcast => {
                        if (!podcast) {
                            return res.sendStatus(404)
                        }

                        res.json(podcast)
                    },
                )
            }
        })
        .catch(err => {
            logger.error(err)
            res.status(422).send(err.errors)
        })
}
