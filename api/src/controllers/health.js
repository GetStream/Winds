import Article from '../models/article'
import Episode from '../models/episode'
import {version} from '../../../app/package.json'
import logger from '../utils/logger'
import moment from 'moment'
import config from '../config'
import Queue from 'bull'

const rssQueue = new Queue('rss', config.cache.uri)
const ogQueue = new Queue('og', config.cache.uri)
const podcastQueue = new Queue('podcast', config.cache.uri)

const queues = {rss: rssQueue, og: ogQueue, podcast: podcastQueue}
const tooOld = 60*60*1000

// Is the webserver running.... yes no
exports.health = (req, res) => {
	res.status(200).send({ version, healthy: '100%' });
};

// Check the server health more extensively...
exports.test = async (req, res) => {
  let output = {version, code: 200}
  // verify that we've recently parsed either an article and an episode
  let latestArticle = await Article.findOne({}, {}, { sort: { createdAt: -1 } })
  let latestEpisode = await Episode.findOne({}, {}, { sort: { createdAt: -1 } })
  let now = new Date()
  output.mostRecentArticle = moment(latestArticle.createdAt).fromNow()
  output.mostRecentEpisode = moment(latestEpisode.createdAt).fromNow()
  if ((now - latestArticle.createdAt > tooOld) || (now - latestEpisode.createdAt > tooOld)) {
    output.code = 500
    output.error = (now - latestArticle.createdAt > tooOld) ? 'The most recent article is too old' : 'The most recent episode is too old'
  }
  // check the queue status
  for (const [key, queue] of Object.entries(queues)) {
    let queueStatus = await queue.getJobCounts()
    output[key] = queueStatus
    if (queueStatus.waiting > 100) {
      output.code = 500
      output.error = `Queue ${key} has more than 100 items waiting to be processed: ${queueStatus.waiting} are waiting`
    }
  }
  // send the response
  res.status(output.code).send(output)
};
