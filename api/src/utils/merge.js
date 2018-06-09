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
    followInstructions.push({type: 'rss', userID: f.userID, publicationID: master._id})
  }
  await Follow.getOrCreateMany(followInstructions)
  // update the follows
  await Follow.update(
    { rss: copy },
    {
      rss: master
    },
  );
  // move the pins where possible
  /*
  let pins = await Pin.find({article__rss=copy._id})
  for (let pin of pins) {
    let article = await Article.find(rss=master, url=pin.article.url)
    await Pin.create(user=pin.user, createdAt=pin.createdAt, article=article)
  }*/
  // Remove the articles
  await Article.remove({rss: copy._id})
}
