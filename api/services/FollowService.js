module.exports = {
    
    followTopics: function(userId, topics, callback) {

        if (!topics || !topics.length) {
            callback(null, null)
            return
        }

        // A: follow the given topics
        // B: find the associated RSS feeds and start follow
        // C: follow the RSS feeds
        // D: send the follow relationship to Stream
        // E: callback

        async.parallel([
            callback => {
                // A: follow the given topics
                function followTopic(topic, callback) {
                    sails.models.follows.findOrCreate({
                        user: userId,
                        topic: topic,
                        type: 'topic'
                    }).exec((err, f) => {
                        callback(err, f)
                    })
                }
                async.map(topics, followTopic, callback)
            },
            callback => {
                // B: find the associated RSS feeds and start follow
                sails.models.feeds.find({
                    topic: topics
                }).exec(function(err, feeds) {
                    if (err) {
                        return callback(err)
                    }
                    async.parallel([
                        callback=> {
                            // C: follow the RSS feeds
                            function followFeed(feed, callback) {
                                sails.models.follows.findOrCreate({
                                    user: userId,
                                    feed: feed.id,
                                    type: 'feed'
                                }).exec((err, f) => {
                                    callback(err, f)
                                })
                            }
                            async.map(feeds, followFeed, callback)
                        }, callback=> {
                            // D: send the follow relationship to Stream
                            let batchFollow = []
                            feeds.forEach(feed => {
                                batchFollow.push({
                                    source: `timeline:${userId}`,
                                    target: `rss_feed:${feed.id}`
                                })
                            })
                            if (!batchFollow.length) {
                                callback(null, null)
                            }
                            StreamService.client.followMany(batchFollow).then(response => {
                                callback(null, response)
                            }).catch(err => {
                                callback(err)
                            })
                        }], callback)
                })
            }], function(err, results) {
                // E: send response
                callback(err, results)
        })
    },
    unfollowTopics: function(userId, topics, callback) {
        if (!topics || !topics.length) {
            return callback(null, null)
        }

        let toRemove = []

        function unfollowTopic(topic, callback) {
            async.parallel(
                [
                    callback => {
                        // Step 1: unfollow the topic
                        sails.models.follows.destroy({
                            user: userId,
                            topic: topic,
                            type: 'topic'
                        }).exec(callback)
                    },
                    callback => {
                        // Step 2: Make a list of feeds to unfollow
                        sails.models.follows.find({
                            user: userId,
                            type: 'feed'
                        }).populate('feed').exec((err, follows) => {
                            follows.forEach(follow => {
                                if (follow.feed.topic === topic) {
                                    // remove this follow
                                    toRemove.push(follow.id)
                                }
                            })
                            callback(err, follows)
                        })
                    }
                ],
                function(err, results) {
                    callback(err, results)
                })
        }
        async.map(topics, unfollowTopic, function(err, results) {
            // unfollow the feeds in our database as well as Stream
            async.parallel([
                callback => {
                    sails.models.follows.destroy({
                        feed: toRemove,
                        type: 'feed'
                    }).exec((err, results) => {
                        callback(err, results)
                    })
                },
                callback => {
                    // Stream doesn't expose a batch unfollow API endpoint
                    // so we loop
                    let timelineFeed = StreamService.client.feed('timeline', userId)
                    function removeFromStream(feedId) {
                        timelineFeed.unfollow('rss_feed', feedId).then(response => {
                            callback(null, response)
                        }).catch(err => {
                            callback(err)
                        })
                    }
                    async.map(toRemove, removeFromStream, callback)
                }
            ], function(err, results) {
                callback(err, results)
            })
        })
    }
}
