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

async function timeIt(name, fn){
	let t0 = new Date()
	let r = await fn()
	statsd.timing(name, (new Date() - t0))
	return r
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
    await timeIt('winds.handle_rss.ack', () => {
    	return markDone(rssID)
    })
    logger.info(`Marked ${rssID} as done`)

    // parse the articles
    let rssContent
    try {
        rssContent = await timeIt('winds.handle_rss.parsing', () => {
        	return util.promisify(ParseFeed)(job.data.url)
        })
    } catch (e) {
        logger.info(`rss scraping broke for url ${job.data.url}`)
        return
    }

	// update the articles
    logger.info(`Updating ${rssContent.articles.length} articles for feed ${rssID}`)

	if (rssContent.articles.length < 1) {
		return
	}

	statsd.increment("winds.handle_rss.articles.parsed", rssContent.articles.length)
	statsd.timing("winds.handle_rss.articles.parsed", rssContent.articles.length)

    let allArticles = await timeIt('winds.handle_rss.upsertManyArticles', () => {
    	return upsertManyArticles(rssID, rssContent.articles)
    })

    // updatedArticles will contain `null` for all articles that didn't get updated, that we already have in the system.
    let updatedArticles = allArticles.filter(updatedArticle => {
        return updatedArticle
    })

	statsd.increment("winds.handle_rss.articles.upserted", updatedArticles.length)

	await timeIt('winds.handle_rss.OgQueueAdd', () => {
		return Promise.all(updatedArticles.map(article => {
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
	})

	let t0 = new Date()
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
	statsd.timing("winds.handle_rss.send_to_stream", (new Date() - t0))
    logger.info(`Completed scraping for ${job.data.url}`)
}

async function upsertManyArticles(rssID, articles) {
	articles = articles.map(a => {
		a.url = normalize(a.url)
		return a
	})

	let articlesData = articles.map(article => {
		const clone = Object.assign({}, article)
		delete(clone.images)
		delete(clone.enclosures)
		delete(clone.publicationDate)
		return clone
	})

	let existingArticles = await Article.find({$or: articlesData}, { "url": 1 })
	let existingArticleUrls = existingArticles.map(a => {return a.url})

	statsd.increment("winds.handle_rss.articles.already_in_mongo", existingArticleUrls.length)

	let articlesToUpsert = articlesData.filter(article => {
		return existingArticleUrls.indexOf(article.url) === -1
	})

	logger.info(`Feed ${rssID}: got ${articles.length} articles of which ${articlesToUpsert.length} need a sync`)

	return Promise.all(articlesToUpsert.map(article => {
		return upsertArticle(rssID, article)
	}))
}

// updateArticle updates the article in mongodb if it changed and create a new one if it did not exist
async function upsertArticle(rssID, post) {
	let search = {
		commentUrl: post.commentUrl,
		content: post.content,
		description: post.description,
		title: post.title,
	};

	let update = Object.assign({}, search)
	update.enclosures = post.enclosures
	update.images = post.images
	update.publicationDate = post.publicationDate
	update.url = post.url
	update.rss = rssID

	try {
		let rawArticle = await Article.findOneAndUpdate(
			{
				$and: [
					{
						rss: rssID,
						url: post.url,
					},
					{
						$or: Object.keys(search).map(k => {
							return {
								[k]: {
									$ne: search[k],
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
				rawResult: true
			},
		)
		if (!rawArticle.lastErrorObject.updatedExisting){
			return rawArticle.value
		}
	} catch(err) {
		if (err.code === 11000){
			statsd.increment("winds.handle_rss.articles.ignored")
			return null
		} else {
			throw err;
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
