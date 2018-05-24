import "./loadenv"
import config from "./config"

import Queue from "bull"
import { getStatsDClient } from "./utils/statsd"

const rssQueue = new Queue("rss", config.cache.uri)
const ogQueue = new Queue("og", config.cache.uri)
const podcastQueue = new Queue("podcast", config.cache.uri)

function makeMetricKey(queue, event) {
    return ["winds", "bull", queue.name, event].join(".")
}

async function trackQueueSize(statsd, queue) {
    let queueStatus = await queue.getJobCounts()
    statsd.gauge(makeMetricKey(queue, "waiting"), queueStatus.waiting)
    statsd.gauge(makeMetricKey(queue, "active"), queueStatus.active)
}

function AddQueueTracking(queue) {
    var statsd = getStatsDClient()

    queue.on("error", function(error) {
        statsd.increment(makeMetricKey(queue, "error"))
    })

    queue.on("active", function(job, jobPromise) {
        statsd.increment(makeMetricKey(queue, "active"))
    })

    queue.on("completed", function(job, result) {
        statsd.timing(makeMetricKey(queue, "elapsed"), new Date() - job.timestamp)
        statsd.increment(makeMetricKey(queue, "completed"))
    })

    queue.on("failed", function(job, err) {
        statsd.increment(makeMetricKey(queue, "failed"))
    })

    queue.on("paused", function() {
        statsd.increment(makeMetricKey(queue, "paused"))
    })

    queue.on("resumed", function(job) {
        statsd.increment(makeMetricKey(queue, "resumed"))
    })

    setInterval(trackQueueSize, 30000, statsd, queue)
}

AddQueueTracking(rssQueue)
AddQueueTracking(ogQueue)
AddQueueTracking(podcastQueue)

exports.RssQueueAdd = rssQueue.add.bind(rssQueue)
exports.OgQueueAdd = ogQueue.add.bind(ogQueue)
exports.PodcastQueueAdd = podcastQueue.add.bind(podcastQueue)

exports.ProcessRssQueue = function() {
    getStatsDClient().increment(makeMetricKey(rssQueue, "started"))
    return rssQueue.process(...arguments)
}

exports.ProcessOgQueue = function() {
    getStatsDClient().increment(makeMetricKey(ogQueue, "started"))
    ogQueue.process(...arguments)
}

exports.ProcessPodcastQueue = function() {
    getStatsDClient().increment(makeMetricKey(podcastQueue, "started"))
    podcastQueue.process(...arguments)
}
