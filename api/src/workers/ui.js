import Arena from "bull-arena"
import express from "express"

import config from "../config"

const router = express.Router()

const arena = Arena({
    queues: [
        {
            hostId: "local",
            name: "rss",
            url: config.cache.uri,
        },
        {
            hostId: "local",
            name: "podcast",
            url: config.cache.uri,
        },
        {
            hostId: "local",
            name: "og",
            url: config.cache.uri,
        },
    ],
})

router.use("/", arena)
