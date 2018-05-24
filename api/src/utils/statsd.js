import { StatsD } from 'node-statsd';

var statsDClient = null

function getStatsDClient() {
    if (!statsDClient) {
        statsDClient = new StatsD()
    }
    return statsDClient
}

exports.getStatsDClient = getStatsDClient;
