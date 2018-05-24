import "../loadenv"
import config from "../config"

import { StatsD } from "node-statsd"

var statsDClient = null

function getStatsDClient() {
    if (!statsDClient) {
        statsDClient = new StatsD({
            host: config.statsd.host,
            port: config.statsd.port,
            prefix: config.statsd.prefix,
        })
    }
    return statsDClient
}

exports.getStatsDClient = getStatsDClient
