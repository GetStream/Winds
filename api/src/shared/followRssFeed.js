// this is split out so that the auth controller can follow featured rss feeds at user creation

import Follow from "../models/follow"
import config from "../config"
import stream from "getstream"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

const followRssFeed = (userID, rssFeedID) => {
    // a couple things happen here:
    // 1. create the follow relationship in mongoDB
    // 2. create the follow relationships in stream (both timeline and user_article)
    // if a follow relationship already exists for that, just return back the follow relationship info - don't 409 on it
    let obj = {
        rss: rssFeedID,
        user: userID,
    }
    return Follow.findOne(obj).then(existingFollow => {
        if (existingFollow) {
            return existingFollow
        } else {
            return Promise.all([
                Follow.create(obj),
                client.feed("user_article", userID).follow("rss", rssFeedID),
                client.feed("timeline", userID).follow("rss", rssFeedID),
            ]).then(results => {
                return results[0]
            })
        }
    })
}

module.exports = followRssFeed
