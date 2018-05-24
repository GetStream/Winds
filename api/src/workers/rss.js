import "../loadenv"

import stream from "getstream"
import moment from "moment"
import normalize from "normalize-url"
import async from "async"

import RSS from "../models/rss"
import Article from "../models/article"

import "../utils/db"
import config from "../config"
import logger from "../utils/logger"
import util from "util"

import sendRssFeedToCollections from "../utils/events/sendRssFeedToCollections"
import { ParseFeed } from "./parsers"

import async_tasks from "../async_tasks"

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret)

// connect the handler to the queue
logger.info("Starting the RSS worker")

// TODO: move this to a separate main.js
async_tasks.ProcessRssQueue(30, handleRSS)

// the top level handleRSS just intercepts error handling before it goes to Bull
async function handleRSS(job) {
    let promise = _handleRSS(job)
    promise.catch(err => {
        logger.warn(`rss job ${job} broke with err ${err}`)
    })
    return promise
}

// Handle Podcast scrapes the podcast and updates the episodes
async function handleRSS(job) {
    logger.info(`Processing ${job.data.url}`)

    // verify we have the rss object
    let rssID = job.data.rss
    let rss = await RSS.findOne({ _id: rssID })
    if (!rss) {
        logger.warn(`RSS with ID ${rssID} does not exist`)
        return
    }

    // mark as done, will be schedule again in 15 min from now
    // we do this early so a temporary failure doesnt leave things in a broken state
    let completed = await markDone(rssID)
    logger.info(`Marked ${rssID} as done`)

    // parse the articles
    let rssContent
    try {
        rssContent = await util.promisify(ParseFeed)(job.data.url)
    } catch (e) {
        logger.info(`rss scraping broke for url ${job.data.url}`)
        return
    }

    // update the articles
    logger.info(`Updating ${rssContent.articles.length} articles for feed ${rssID}`)
    let allArticles = await Promise.all(
        rssContent.articles.map(article => {
            let normalizedUrl = normalize(article.url)
            article.url = normalizedUrl
            return updateArticle(rssID, normalizedUrl, article)
        }),
    )

    // updatedArticles will contain `null` for all articles that didn't get updated, that we alrady have in the system.
    let updatedArticles = allArticles.filter(updatedArticle => {
        return updatedArticle
    })

    let rssFeed = streamClient.feed("rss", rssID)
    logger.info(`Syncing ${updatedArticles.length} articles to Stream`)
    if (updatedArticles.length > 0) {
        let chunkSize = 100
        for (let i = 0, j = updatedArticles.length; i < j; i += chunkSize) {
            let chunk = updatedArticles.slice(i, i + chunkSize)

            let streamArticles = chunk.map(article => {
                return {
                    actor: article.rss,
                    foreign_id: `articles:${article._id}`,
                    object: article._id,
                    time: article.publicationDate,
                    verb: "rss_article",
                }
            })

            let streamResponse = await rssFeed.addActivities(streamArticles)
            let response = await sendRssFeedToCollections(job.data.rss)
        }
    }
    logger.info(`Completed scraping for ${job.data.url}`)
}

// updateArticle updates the article in mongodb
async function updateArticle(rssID, normalizedUrl, post) {
    let rawArticle = await Article.findOneAndUpdate(
        {
            rss: rssID,
            url: normalizedUrl,
        },
        {
            commentUrl: post.commentUrl,
            content: post.content,
            description: post.description,
            images: post.images || {},
            publicationDate: post.publicationDate,
            rss: rssID,
            title: post.title,
            url: post.url,
        },
        {
            new: true,
            rawResult: true,
            upsert: true,
        },
    )
    if (rawArticle.lastErrorObject.updatedExisting) {
        // article already exists
        return
    }

    let article = rawArticle.value
    // after article is created, add to algolia, stream, and og scraper queue
    let response = await async_tasks.OgQueueAdd(
        {
            type: "rss",
            url: article.url,
        },
        {
            removeOnComplete: true,
            removeOnFail: true,
        },
    )
    return article
}

// markDone sets lastScraped to now and isParsing to false
async function markDone(rssID) {
    /*
	Set the last scraped for the given rssID
	*/
    let now = moment().toISOString()
    let updated = await RSS.update(
        { _id: rssID },
        {
            lastScraped: now,
            isParsing: false,
        },
    )
    return updated
}
