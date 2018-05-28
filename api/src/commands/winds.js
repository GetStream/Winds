#!/usr/bin/env ./node_modules/.bin/babel-node

import "../loadenv"
import "../utils/db"
import program from "commander"
import logger from "../utils/logger"

import { version } from "../../../app/package.json"

program
    .version(version)
    .command('og <urls>', 'OG debugging')
    .command('feed', 'Debug RSS feeds')
    .command('rescrape-og', 'rescrape og for everything')
    .command('reset-parsing-state', 'reset the parsing state on rss and podcass')

    .parse(process.argv)

function main() {
    logger.info("Winds CLI, Have fun!")
}

main()
