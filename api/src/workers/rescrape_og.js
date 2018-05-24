import "../loadenv"
import "../utils/db"
import { ParseFeed, ParsePodcast } from "./parsers"
import program from "commander"
import chalk from "chalk"
import logger from "../utils/logger"
import Podcast from "../models/podcast"
import Article from "../models/article"
import Episode from "../models/episode"

import RSS from "../models/rss"
import config from "../config"

import async_tasks from "../async_tasks"

const version = "0.1.1"

program
    .version(version)
    .option("--rss <value>", "Parse a specific RSS feed")
    .option("--podcast <value>", "Parse a specific podcast")
    .option("-l, --limit <n>", "The number of articles to parse", 2)
    .option("--task", "Create a task on bull or not")
    .parse(process.argv)

async function main() {
    // Note the weird rss-> Article mapping
    let schemas = { rss: Article, episode: Episode, podcast: Podcast }
    let fieldMap = { rss: "url", episode: "link", podcast: "url" }

    for (const [contentType, schema] of Object.entries(schemas)) {
        let instances = await schema.find({})
        let field = fieldMap[contentType]
        logger.info(`found ${instances.length} for ${contentType} with url field ${field}`)
        let chunkSize = 1000

        for (let i = 0, j = instances.length; i < j; i += chunkSize) {
            let chunk = instances.slice(i, i + chunkSize)
            logger.info(`handling chunk of size ${chunk.length}`)
            let promises = []
            for (const instance of chunk) {
                if (!instance.images || !instance.images.og) {
                    let promise = async_tasks.OgQueueAdd(
                        {
                            type: contentType,
                            url: instance[field],
                        },
                        {
                            removeOnComplete: true,
                            removeOnFail: true,
                        },
                    )
                    promises.push(promise)
                }
            }
            logger.info(`scheduled ${promises.length} for og scraping, waiting now`)
            let results = await Promise.all(promises)
        }

        logger.info(`completed for type ${contentType} with field ${field}`)
    }
}

main()
    .then(result => {
        logger.info(`completed it all, open the test page to see queue status`)
    })
    .catch(err => {
        logger.info(`failed with err ${err}`)
    })
