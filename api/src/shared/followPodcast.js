// this is split out so that the auth controller can follow featured podcasts at user creation

import Follow from "../models/follow"
import config from "../config"
import stream from "getstream"

const client = stream.connect(config.stream.apiKey, config.stream.apiSecret)

const followPodcast = (userID, podcastID) => {
    // couple things:
    // find follow relationship already in DB - if it exists, return it, don't send a 409
    // if not, create a new one, and:
    // timeline follows podcast
    // user_episode follows podcast
    let obj = {
        podcast: podcastID,
        user: userID,
    }
    return Follow.findOne(obj).then(existingFollow => {
        if (existingFollow) {
            return existingFollow
        } else {
            return Promise.all([
                Follow.create(obj),
                client.feed("user_episode", userID).follow("podcast", podcastID),
                client.feed("timeline", userID).follow("podcast", podcastID),
            ]).then(results => {
                return results[0]
            })
        }
    })
}

module.exports = followPodcast
