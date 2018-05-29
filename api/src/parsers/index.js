import strip from "strip"
import sanitizeHtml from "sanitize-html"
import entities from "entities"
import moment from "moment"
import request from "request"
import normalize from "normalize-url"
import FeedParser from "feedparser"
import podcastParser from "./podcast_parser_sax"

import Podcast from "../models/podcast" // eslint-disable-line
import Episode from "../models/episode"

import config from "../config" // eslint-disable-line
import logger from "../utils/logger"
import { getStatsDClient } from '../utils/statsd';

const WindsUserAgent = "Winds: Open Source RSS & Podcast app: https://getstream.io/winds/"
const AcceptHeader = "text/html,application/xhtml+xml,application/xml"
const statsd = getStatsDClient()

// sanitize cleans the html before returning it to the frontend
var sanitize = function(dirty) {
    return sanitizeHtml(dirty, {
        allowedAttributes: {
            img: ["src", "title", "alt"],
        },
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    })
}

function ParseFeed(feedUrl, callback) {
    let t0 = new Date()
    let t1 = null
    let t2 = null

	let feedparser = new FeedParser()
	let feedContents = { articles: [] }

    let req = request(feedUrl, {
        pool: false,
        timeout: 6000,
		gzip: true,
    }, (error, response, body) => {

        if (error) {
			return callback(error, feedContents)
        }

        if (response.statusCode !== 200) {
            logger.warn(`${feedUrl} returned status code ${response.statusCode}, skipping`)
			return callback(null, feedContents)
		}

		statsd.timing("winds.parsers.feed.transfer", (new Date() - t1))
		t2 = new Date()
		feedparser.end(body, ()=>{
			statsd.timing("winds.parsers.feed.write_to_parser_stream", (new Date() - t2))
		})
    })

    req.setMaxListeners(50)
    req.setHeader("User-Agent", WindsUserAgent)
    req.setHeader("Accept", AcceptHeader)

    req.on("error", err => {
        callback(err, feedContents)
    })

    req.on("response", res => {
		if (res.statusCode === 200) {
			t1 = new Date()
			statsd.timing("winds.parsers.feed.ttfb", (new Date() - t0))
		}
    })

    feedparser.on("error", err => {
        callback(err, feedContents)
    })

    feedparser.on("end", () => {
        if (t2 !== null){
			statsd.timing("winds.parsers.feed.finished_parsing", (new Date() - t2))
        }
        callback(null, feedContents)
    })

    feedparser.on("readable", () => {
        let postBuffer
        while ((postBuffer = feedparser.read())) {
            let post = Object.assign({}, postBuffer)

            let description = strip(entities.decodeHTML(post.description)).substring(0, 280)

            let parsedArticle = {
                content: sanitize(post.summary),
                description: description,
                enclosures: post.enclosures,
                publicationDate:
                    moment(post.pubdate).toISOString() ||
                    moment()
                        .subtract(feedContents.articles.length, "minutes") // feedContents.articles only gets pushed to every time we parse an article, so it serves as a reasonable offset.
                        .toISOString(),
                title: strip(entities.decodeHTML(post.title)),
                url: normalize(post.link),
                // For some sites like XKCD the content from RSS is better than Mercury
                // note that we don't actually get the images, OG scraping is more reliable
            }

            // HNEWS
            if (post.comments) {
                parsedArticle.commentUrl = post.comments
            }

            // product hunt comments url
            if (post.link.indexOf("https://www.producthunt.com") === 0) {
                let matches = post.description.match(/(https:\/\/www.producthunt.com\/posts\/.*)"/)
                if (matches.length) {
                    parsedArticle.commentUrl = matches[1]
                }
            }

            // nice images for XKCD
            if (post.link.indexOf("https://xkcd") === 0) {
                let matches = post.description.match(/(https:\/\/imgs.xkcd.com\/comics\/.*?)"/)
                if (matches.length) {
                    parsedArticle.images = { og: matches[1] }
                }
            }

            feedContents.articles.push(parsedArticle)
            feedContents.title = post.meta.title
            feedContents.link = post.meta.link
            feedContents.image = post.meta.image
        }
    })
}

function ParsePodcast(podcastUrl, callback) {
    logger.info(`Attempting to parse podcast ${podcastUrl}`)
    let opts = {
        headers: {
            Accept: AcceptHeader,
            "User-Agent": WindsUserAgent,
        },
        pool: false,
        timeout: 10000,
        url: podcastUrl,
    }

    let podcastContents = { episodes: [] }

    request(opts, (error, response, responseData) => {
        // easy way to detect charset or encoding issues
        // let partialBody = response.body.substring(0,500)
        //logger.debug(`${podcastUrl} response \n${partialBody}`)
        podcastParser(responseData, (err, data) => {
            if (err) {
                return callback(err, null)
            }

            // the podcast metadata we care about:
            podcastContents.title = data.title
            podcastContents.link = data.link
            podcastContents.image = data.image
            podcastContents.description = data.description ? data.description.long : ""

            let episodes = data.episodes ? data.episodes : data

            episodes.map(episode => {
                try {
                    let url = episode.link
                    if (!url) {
                        url = episode.enclosure ? episode.enclosure.url : episode.guid
                    }
                    var parsedEpisode = new Episode({
                        description: strip(episode.description).substring(0, 280),
                        duration: episode.duration,
                        enclosure: episode.enclosure && episode.enclosure.url,
                        images: { og: episode.image },
                        link: episode.link,
                        publicationDate:
                            moment(episode.published).toISOString() ||
                            moment()
                                .subtract(podcastContents.episodes.length, "minutes")
                                .toISOString(),
                        title: strip(episode.title),
                        url: normalize(url),
                    })
                } catch (e) {
                    logger.error("Failed to parse episode", e)
                }
                podcastContents.episodes.push(parsedEpisode)
            })
            callback(null, podcastContents)
        })
    })
}

exports.ParseFeed = ParseFeed
exports.ParsePodcast = ParsePodcast
