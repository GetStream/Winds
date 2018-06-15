import RSS from '../models/rss';
import Podcast from '../models/podcast';
import Follow from '../models/follow';

import Pin from '../models/pin';
import Article from '../models/article';

import logger from '../utils/logger';

export async function mergeFeeds(masterID, copyID) {
  let master = await RSS.findById(masterID)
  let copy = await RSS.findById(copyID)
  logger.info(`Removing copy ${copy.feedUrl} and merging it with ${master.feedUrl}`)
  // get the follow relationships
  let follows = await Follow.find({rss: copy})
  // unfollow all of them
  for (let f of follows) {
    await f.removeFromStream()
  }
  // refollow all of them
  let followInstructions = []
  for (let f of follows) {
    followInstructions.push({type: 'rss', userID: f.user._id, publicationID: master._id})
  }
  await Follow.getOrCreateMany(followInstructions)
  logger.info(`Removed ${follows.length} follow from stream and added them for the new feed`)
  // update the follows
  // TODO is there a better way to handle unique constrains with MongoDB
  let existingFollows = await Follow.find({rss: master})
  let existingFollowIDs = existingFollows.map(f=> {f._id})
  let result = await Follow.update(
    { $and: [{rss: copy}, {id: {$nin: existingFollowIDs}}] },
    {
      rss: master
    }, {multi: true}
  );
  logger.info(`Updated the follow records, found ${existingFollows.length} existing follows, ${result.nModified} changed`)

  // move the pins where possible
  let articles = await Article.find({rss: copy._id})
  let articleIDs = articles.map((a) => a._id)
  logger.info(`Updating pin references for ${articles.length} articles`)

  let pins = await Pin.find({article: {$in: articleIDs}})
  for (let pin of pins) {
    let newArticle = await Article.findOne({rss: master, url: pin.article.url})
    if (newArticle) {
      // create a new
      await Pin.create({user: pin.user, createdAt: pin.createdAt, article: newArticle})
    }
    // always remove the old to prevent broken state
    await pin.remove()
  }
  logger.info(`Updated all pins, removing old data now`)
  // Remove the old articles
  await Article.remove({rss: copy._id})
  // Remove the old feed
  let feedUrl = copy.feedUrl
  await copy.remove()

  // TODO: merge the feed url information
  let feedUrls = [master.feedUrl].concat(master.feedUrls, [copy.feedUrl], copy.feedUrls)
  let uniqueUrls = {}
  for (let url of feedUrls) {
    uniqueUrls[url] = 1
  }
  let newFeedUrls = Object.keys(uniqueUrls)
  logger.info(`FeedUrls is now ${newFeedUrls}`)
  master.feedUrls = newFeedUrls
  await master.save()
  logger.info(`Completed the merge. ${copy.feedUrl} is now merged with ${master.feedUrl}`)

  return master
}
