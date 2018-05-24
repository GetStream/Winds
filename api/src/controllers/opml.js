import events from "../utils/events"
import async from "async"
import isUrl from "url-regex"
import opmlParser from "node-opml-parser"
import opmlGenerator from "opml-generator"
import moment from "moment"
import entities from "entities"
import normalizeUrl from "normalize-url"
import stream from "getstream"
import search from "../utils/search"

import RSS from "../models/rss"
import Follow from "../models/follow"

import config from "../config"
import logger from "../utils/logger"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

exports.get = (req, res) => {
    Follow.find({
        rss: { $exists: true },
        user: req.user.sub,
    })
        .then(rss => {
            const header = {
                dateCreated: moment().toISOString(),
                ownerName: rss[0].follower.name,
                title: `Subscriptions in Winds - Powered by ${config.product.author}`,
            }

            async.mapLimit(
                rss,
                rss.length,
                (feed, cb) => {
                    let obj = {
                        htmlUrl: feed.rss.url,
                        title: feed.rss.title,
                        type: "rss",
                        xmlUrl: feed.rss.feedUrl,
                    }

                    cb(null, obj)
                },
                (err, outlines) => {
                    const opml = opmlGenerator(header, outlines)

                    res.set({
                        "Content-Disposition": "attachment; filename=export.opml;",
                        "Content-Type": "application/xml",
                    })

                    res.end(opml)
                },
            )
        })
        .catch(err => {
            if (err) {
                logger.error(err)
            }

            res.status(422).send(err.errors)
        })
}

exports.post = (req, res) => {
    const upload = Buffer.from(req.file.buffer).toString("utf8")
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {}

    if (!upload) {
        return res.sendStatus(422)
    }

    opmlParser(upload, (err, feeds) => {
        if (err) {
            logger.error(err)
            res.status(422).send(err.errors)
        }

        Promise.all(
            feeds.map(feed => {
                let url = feed.url || ""
                let feedUrl = feed.feedUrl || ""

                if (isUrl().test(url)) {
                    url = normalizeUrl(url)
                }

                if (isUrl().test(feedUrl)) {
                    feedUrl = normalizeUrl(feedUrl)
                }

                let favicon = ""
                if (feeds.site && feeds.site.favicon) {
                    favicon = feeds.site.favicon
                }

                // first, check to see if there's an RSS feed with the same feedURL
                return RSS.findOne({ feedUrl })
                    .then(rss => {
                        if (!rss) {
                            // if not, create it, add it to stream personalization, add it to algolia, and pass it down the promise chain
                            return RSS.create({
                                categories: "RSS",
                                description: entities.decodeHTML(feed.title),
                                favicon: favicon,
                                feedUrl: feedUrl,
                                lastScraped: moment().subtract(12, "hours"),
                                public: true,
                                publicationDate: moment().toISOString(),
                                title: entities.decodeHTML(feed.title),
                                url: url,
                            }).then(newRss => {
                                return Promise.all([
                                    search({
                                        _id: newRss._id,
                                        categories: "RSS",
                                        description: newRss.title,
                                        image: newRss.favicon,
                                        public: true,
                                        publicationDate: newRss.publicationDate,
                                        title: newRss.title,
                                        type: "rss",
                                    }),
                                    events({
                                        meta: {
                                            data: {
                                                [`rss:${newRss._id}`]: {
                                                    description: newRss.description,
                                                    title: newRss.title,
                                                },
                                            },
                                        },
                                    }),
                                ]).then(() => {
                                    // pass the newly created rss feed (NOT the results from algolia / personalization) down the promise chain
                                    return newRss
                                })
                            })
                        } else {
                            // if so, update it, pass the updated version down the promise chain
                            return RSS.findByIdAndUpdate(
                                rss._id,
                                {
                                    $set: {
                                        categories: "RSS",
                                        description: entities.decodeHTML(feed.title),
                                        favicon: favicon,
                                        feedUrl: feedUrl,
                                        lastScraped: moment().subtract(12, "hours"),
                                        public: true,
                                        publicationDate: moment().toISOString(),
                                        title: entities.decodeHTML(feed.title),
                                        url: url,
                                    },
                                },
                                {
                                    new: true,
                                    upsert: true,
                                },
                            )
                        }
                    })
                    .then(rss => {
                        // TODO: switch this over to use the "shared" js

                        // then, regardless of if it was created or not, create the follow in mongodb, set the timeline and user_article feeds to follow in stream
                        return Promise.all([
                            Follow.create({
                                rss: rss._id,
                                user: req.user.sub,
                            }),
                            client.feed("user_article", data.user).follow("rss", rss._id),
                            client.feed("timeline", data.user).follow("rss", rss._id),
                        ]).then(() => {
                            return rss
                        })
                    })
            }),
        )
            .then(results => {
                res.json(results)
            })
            .catch(err => {
                res.status(500).send(err.message)
            })
    })
}
