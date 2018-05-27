import "../loadenv"

import program from "commander"
import chalk from "chalk"
import logger from "../utils/logger"
import config from "../config"
import ogs from "open-graph-scraper"
import normalize from "normalize-url"
import fs from "fs"
import async from "async"
import rssFinder from "rss-finder"
import normalizeUrl from "normalize-url"
import podcastFinder from "rss-finder"
import { ParsePodcast } from "../workers/parsers"
import strip from "strip"
import Podcast from "../models/podcast"
import RSS from "../models/rss"
import moment from "moment"
import "../utils/db"
import entities from "entities"

import validUrl from "valid-url"

import User from "../models/user"

import personalization from "../utils/personalization"
import search from "../utils/search"
import async_tasks from "../async_tasks"

const version = "0.0.1"

program
    .version(version)
    .option("--type <value>", "The type: episode, podcast or article")
    .option("--url <value>", "The url to try and scrape")
    .option("--task", "Create a task on bull or not")
    .parse(process.argv)

process.on("unhandledRejection", err => {
    console.error(err)
    process.exit(1)
})

function FindMeSomeRSS(url) {
    return rssFinder(normalizeUrl(url))
}

function UpdateThatRSS() {
    var promise = RSS.findOneAndUpdate(
        { feedUrl: feed.url },
        {
            categories: featuredRSS.category,
            description: entities.decodeHTML(feed.title),
            featured: false,
            feedUrl: feed.url,
            images: {
                favicon: feeds.site.favicon,
            },
            lastScraped: moment().format(),
            title: featuredRSS.name,
            url: feeds.site.url,
            valid: true,
        },
        {
            new: true,
            rawResult: true,
            upsert: true,
        },
    )
}

async function test(featuredRSS) {
    let structure = await FindMeSomeRSS("http://alistapart.com/main/feed")
    let site = structure.site
    for (let feed of structure.feedUrls) {
        let feedTitle = feed.title
        if (feedTitle.toLowerCase() === "rss") {
            feedTitle = feeds.site.title
        }

        let feedUrl = feed.url
        let rss = {
            categories: featuredRSS.category,
            description: entities.decodeHTML(feed.title),
            featured: false,
            feedUrl: feed.url,
            images: {
                favicon: site.favicon,
            },
            lastScraped: moment().format(),
            title: featuredRSS.name,
            url: site.url,
            valid: true,
        }

        RSS.findOneAndUpdate({ feedUrl: feedUrl }, rss, {
            new: true,
            rawResult: true,
            upsert: true,
        })
            .then(function() {
                console.log(arguments)
            })
            .catch(function() {
                console.log("err", arguments)
            })
        //console.log('result', result)
    }
}

function main() {
    // This is a small helper tool to quickly help debug issues with podcasts or RSS feeds
    logger.info("Starting to load the featured feeds")
    var featured = JSON.parse(fs.readFileSync("featured.json", "utf8"))

    async.mapLimit(
        featured.rss,
        10,
        (featuredRSS, loopCb) => {
            logger.info(`Now Handling RSS Feed ${featuredRSS.name}`)

            rssFinder(normalizeUrl(featuredRSS.feedUrl))
                .catch(function(err) {
                    logger.warn(`RSS Finder broke ${featuredRSS.feedUrl} with err ${err}`)
                    loopCb()
                    return
                })
                .then(feeds => {
                    if (!feeds.feedUrls.length) {
                        logger.warn(
                            `We couldn\'t find any feeds for that RSS feed URL :( ${
                                featuredRSS.feedUrl
                            }`,
                        )
                        return loopCb()
                    }

                    async.mapLimit(
                        feeds.feedUrls,
                        feeds.feedUrls.length,
                        (feed, cb) => {
                            let feedTitle = feed.title

                            if (feedTitle.toLowerCase() === "rss") {
                                feedTitle = feeds.site.title
                            }

                            var promise = RSS.findOneAndUpdate(
                                { feedUrl: feed.url },
                                {
                                    interest: featuredRSS.category,
                                    categories: "RSS",
                                    description: entities.decodeHTML(feed.title),
                                    featured: false,
                                    feedUrl: feed.url,
                                    images: {
                                        favicon: feeds.site.favicon,
                                    },
                                    lastScraped: moment().format(),
                                    title: featuredRSS.name,
                                    url: feeds.site.url,
                                    valid: true,
                                },
                                {
                                    new: true,
                                    rawResult: true,
                                    upsert: true,
                                },
                            )

                            promise
                                .then(rss => {
                                    if (rss.lastErrorObject.updatedExisting) {
                                        cb(null, rss.value)
                                    } else {
                                        search({
                                            _id: rss.value._id,
                                            categories: "RSS",
                                            description: rss.value.title,
                                            image: rss.value.favicon,
                                            public: true,
                                            publicationDate: rss.value.publicationDate,
                                            title: rss.value.title,
                                            type: "rss",
                                        })
                                            .then(() => {
                                                return async_tasks.RssQueueAdd(
                                                    {
                                                        rss: rss.value._id,
                                                        url: rss.value.feedUrl,
                                                    },
                                                    {
                                                        priority: 1,
                                                        removeOnComplete: true,
                                                        removeOnFail: true,
                                                    },
                                                )
                                            })
                                            .then(() => {
                                                cb(null, rss.value)
                                            })
                                            .catch(err => {
                                                cb(err)
                                            })
                                    }
                                })
                                .catch(err => {
                                    logger.warn("broken", err)
                                    cb(err)
                                })
                        },
                        (err, results) => {
                            if (err) {
                                logger.warn("really broken", err)
                                return loopCb()
                            }
                            loopCb()
                        },
                    )
                })
        },
        function() {
            logger.info(`Finished with Feeds`)
        },
    )

    async.mapLimit(
        featured.podcasts,
        10,
        (featuredPodcast, loopCb) => {
            logger.info(`Now Handling Podcast ${featuredPodcast.name}`)

            podcastFinder(normalizeUrl(featuredPodcast.feedUrl))
                .catch(err => {
                    logger.error(`podcastFinder broke ${featuredPodcast.feedUrl}`)
                    loopCb()
                })
                .then(feeds => {
                    if (!feeds || !feeds.feedUrls.length) {
                        logger.error(`no feeds found for ${featuredPodcast.feedUrl}`)
                        return loopCb()
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
                                        interest: featuredPodcast.category,
                                        categories: "podcast",
                                        description: description,
                                        featured: false,
                                        feedUrl: feed.url,
                                        images: images,
                                        lastScraped: new Date(0),
                                        title: featuredPodcast.name,
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
                                                    if (!podcast.value.images.og) {
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
                                        logger.error(`Podcast parsing broke for ${feed.url}`)
                                        cb(err)
                                    })
                            })
                        },
                        (err, results) => {
                            if (err) {
                                logger.error(`broken stuff with error ${err}`)
                                loopCb()
                                return
                            }

                            loopCb()
                        },
                    )
                })
        },
        function() {
            logger.info(`finished with podcasts`)
        },
    )
}

main()
