import "../loadenv"

import RSS from "../models/rss"
import Podcast from "../models/rss"

import "../utils/db"
import logger from "../utils/logger"

logger.info("Starting the RSS reset")

RSS.update({}, { isParsing: false }, { multi: true })
    .then(res => {
        logger.info(`Completed update for all RSS feeds`)
    })
    .catch(err => {
        logger.error(err)
    })

Podcast.update({}, { isParsing: false }, { multi: true })
    .then(res => {
        logger.info(`Completed update for all podcast feeds`)
    })
    .catch(err => {
        logger.error(err)
    })
