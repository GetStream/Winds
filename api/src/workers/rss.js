import "../loadenv"

import stream from "getstream"
import moment from "moment"
import normalize from "normalize-url"

import RSS from "../models/rss"
import Article from "../models/article"

import "../utils/db"
import config from "../config"
import logger from "../utils/logger"
import util from "util"

import sendRssFeedToCollections from "../utils/events/sendRssFeedToCollections"
import { ParseFeed } from "../parsers"

import async_tasks from "../async_tasks"
import { getStatsDClient } from '../utils/statsd';

const streamClient = stream.connect(config.stream.apiKey, config.stream.apiSecret)

// connect the handler to the queue
logger.info("Starting the RSS worker")

// TODO: move this to a separate main.js
async_tasks.ProcessRssQueue(30, handleRSS)

const statsd = getStatsDClient()

// the top level handleRSS just intercepts error handling before it goes to Bull
async function handleRSS(job) {
    let promise = _handleRSS(job)
    promise.catch(err => {
        logger.warn(`rss job ${job} broke with err ${err}`)
        console.log(err)

    })
    return promise
}

// Handle Podcast scrapes the podcast and updates the episodes
async function _handleRSS(job) {
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
    await markDone(rssID)
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

	statsd.increment("winds.handle_rss.articles.parsed", rssContent.articles.length)

    let allArticles = await Promise.all(
        rssContent.articles.map(article => {
            let normalizedUrl = normalize(article.url)
            article.url = normalizedUrl
			// XXX: this is an easy way to rewrite all articles in case normalize ever changes
            return upsertArticle(rssID, normalizedUrl, article)
        }),
    )

    // updatedArticles will contain `null` for all articles that didn't get updated, that we already have in the system.
    let updatedArticles = allArticles.filter(updatedArticle => {
        return updatedArticle
    })

	statsd.increment("winds.handle_rss.articles.upserted", updatedArticles.length)

	await Promise.all(updatedArticles.map(article => {
		async_tasks.OgQueueAdd(
			{
				type: 'rss',
				url: article.url,
			},
			{
				removeOnComplete: true,
				removeOnFail: true,
			},
		)
	}))

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
            await rssFeed.addActivities(streamArticles)
        }
		await sendRssFeedToCollections(rss)
    }
    logger.info(`Completed scraping for ${job.data.url}`)
}

// updateArticle updates the article in mongodb if it changed and create a new one if it did not exist
async function upsertArticle(rssID, normalizedUrl, post) {
	let update = {
		commentUrl: post.commentUrl,
		content: post.content,
		description: post.description,
		publicationDate: post.publicationDate,
		rss: rssID,
		title: post.title,
		url: post.url,
    enclosures: post.enclosures,
	};

	// in almost all cases images are added by OG scraping, only include images if not empty
	if (post.images && Object.keys(post.images).length > 0) {
		update.images = post.images
	}

	try {
		return await Article.findOneAndUpdate(
			{
				$and: [
					{
						rss: rssID,
						url: normalizedUrl,
					},
					{
						$or: Object.keys(update).map(k => {
							return {
								[k]: {
									$ne: update[k],
								},
							};
						}),
					},
				],
			},
			update,
			{
				new: true,
				upsert: true,
			},
		)
	} catch(err) {
		if (err.code === 11000){
			statsd.increment("winds.handle_rss.articles.ignored")
			return null
		} else {
			throw error;
		}
	}
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
