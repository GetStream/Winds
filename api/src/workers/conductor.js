import "../loadenv"

import async from "async"
import moment from "moment"

import RSS from "../models/rss"
import Podcast from "../models/podcast"

import db from "../utils/db"
import config from "../config"
import logger from "../utils/logger"

import async_tasks from "../async_tasks"

const publicationTypes = {
    rss: { schema: RSS, enqueue: async_tasks.RssQueueAdd },
    podcast: { schema: Podcast, enqueue: async_tasks.PodcastQueueAdd },
}
const conductorInterval = 60
const durationInMinutes = 15

// conductor runs conduct every interval seconds
const conductor = () => {
    logger.info(`Starting the conductor... will conduct every ${conductorInterval} seconds`)

    function forever() {
        conduct()
        setTimeout(forever, conductorInterval * 1000)
    }
    forever()
}
conductor()

// conduct does the actual work of scheduling the scraping
async function conduct() {
    for (const [publicationType, publicationConfig] of Object.entries(publicationTypes)) {
        // lookup the total number of rss feeds or podcasts
        let total = await publicationConfig.schema.count({})
        // never schedule more than 1/15 per minute interval
        let maxToSchedule = Math.ceil(total / 15 + 1)
        logger.info(
            `conductor will schedule at most ${maxToSchedule} to scrape per ${conductorInterval} seconds`,
        )
        // find the publications that we need to update
        let publications = await publicationConfig.schema
            .find({
                isParsing: {
                    $ne: true,
                },
                lastScraped: {
                    $lte: moment()
                        .subtract(durationInMinutes, "minutes")
                        .toDate(),
                },
            })
            .limit(maxToSchedule)

        // make sure we don't schedule these guys again till its finished
        let publicationIDs = []
        for (let publication of publications) {
            publicationIDs.push(publication._id)
        }
        let updated = await publicationConfig.schema.update(
            { _id: { $in: publicationIDs } },
            {
                isParsing: true,
            },
            {
                multi: true,
            },
        )
        logger.info(`marked ${updated.nModified} publications as isParsing`)

        // actually schedule the update
        logger.info(`conductor found ${publications.length} of type ${publicationType} to scrape`)
        let promises = []
        for (let publication of publications) {
            let job = { url: publication.feedUrl }
            job[publicationType] = publication._id
            let promise = publicationConfig.enqueue(job, {
                removeOnComplete: true,
                removeOnFail: true,
            })
            promises.push(promise)
        }
        let results = await Promise.all(promises)

        logger.info(`Processing complete! Will try again in ${conductorInterval} seconds...`)
    }
}
