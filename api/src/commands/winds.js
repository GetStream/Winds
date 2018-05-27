import "../loadenv"
import "../utils/db"
import { ParseFeed, ParsePodcast } from "../parsers"
import program from "commander"
import chalk from "chalk"
import logger from "../utils/logger"
import Podcast from "../models/podcast"
import RSS from "../models/rss"
import config from "../config"

import async_tasks from "../async_tasks"

const version = "0.1.1"

program
    .version(version)
    .command('og [url]', 'og debugging')
    .command('rss [feedUrl]', 'rss debugging')
    .command('podcast [feedUrl]', 'podcast debuging')
    .parse(process.argv)

function main() {
    // This is a small helper tool to quickly help debug issues with podcasts or RSS feeds
    logger.info("Starting the RSS Debugger \\0/")
    logger.info("Please report issues with RSS feeds here https://github.com/getstream/winds")
    logger.info("Note that pull requests are much appreciated!")
    let target = program.rss || program.podcast
    logger.info(`Looking up the first ${program.limit} articles from ${target}`)

}

main()
