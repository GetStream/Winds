import program from "commander"
import chalk from "chalk"
import logger from "../utils/logger"
import Queue from "bull"
import config from "../config"
const version = "0.0.1"
import ogs from "open-graph-scraper"
import normalize from "normalize-url"
import async_tasks from "../async_tasks"

program
    .version(version)
    .option("--type <value>", "The type: episode, podcast or article")
    .option("--url <value>", "The url to try and scrape")
    .option("--task", "Create a task on bull or not")
    .parse(process.argv)

function main() {
    // This is a small helper tool to quickly help debug issues with podcasts or RSS feeds
    logger.info("Starting the OG queue Debugger \\0/")
    let normalizedUrl = normalize(program.url)
    logger.info(`Looking for og images at ${normalizedUrl} for type ${program.type}`)

    ogs({
        followAllRedirects: true,
        maxRedirects: 20,
        timeout: 3000,
        url: normalizedUrl,
    })
        .then(image => {
            if (!image.data.ogImage || !image.data.ogImage.url) {
                logger.info(chalk.red(`OG scraping didn't find an image for ${normalizedUrl}`))
            } else {
                logger.info(
                    chalk.green(`Image found for ${normalizedUrl}: ${image.data.ogImage.url}`),
                )
            }
        })
        .catch(err => {
            logger.info(`failed to parse OG images`)
        })

    if (program.task) {
        logger.info(`creating a task on the bull queue`)
        async_tasks
            .OgQueueAdd(
                {
                    url: normalizedUrl,
                    type: program.type,
                    update: true,
                },
                {
                    removeOnComplete: true,
                    removeOnFail: true,
                },
            )
            .then(() => {
                logger.info(`task sent to bull, time to run pm2 log og`)
            })
            .catch(err => {
                logger.error(`Failed to schedule task on og queue`)
            })
    }
}

main()
