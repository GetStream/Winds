/**
 * FollowsController
 *
 * @description :: Server-side logic for managing follows
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    unfollowFeed: function(req, res) {

        let feedId = req.body.feed_id,
            userId = req.user.id

        if (!feedId) return res.badRequest('Missing feed id')

        async.parallel([

            callback => {

                // remove the follow relationship
                sails.models.follows.destroy({user: userId, feed: feedId, type: 'feed'}).exec(callback)

            }, callback => {

                let timelineFeed = StreamService.client.feed('timeline', userId)
                timelineFeed.unfollow('rss_feed', feedId).then(response => {
                    callback(null, response)
                }).catch(err => {
                    callback(err)
                })

            }], function(err, results) {

                if (err) {
                    sails.log.error('failed to unfollow feed', err)
                    return res.serverError(err)
                }

                return res.ok({
                    feedId: feedId,
                    userId: req.user.id
                })

        })

    },

    followTopics: function(req, res, next) {

        let topicsToFollow   = req.param('follow'),
            topicsToUnfollow = req.param('unfollow'),
            user             = req.user.id

        async.parallel([
            callback => {
                FollowService.followTopics(user, topicsToFollow, callback)
            },
            callback => {
                FollowService.unfollowTopics(user, topicsToUnfollow, callback)
            }
        ], function(err, results) {

            if (err) return res.serverError(err)

            return res.ok({
                follow: topicsToFollow,
                unfollow: topicsToUnfollow
            })

        })

    },

    readFollows: function(req, res, next) {

        const url = require('url')

        let user = req.user.id,
            filter = { user: user },
            type = req.param('type')

        if (type) filter.type = type

        sails.models.follows.find(filter).populate(['feed', 'topic']).exec(function(err, follows) {

            if (err) return res.serverError(err)

            let siteIds = []

            follows.forEach(follow => {
                if (follow.type == 'feed') {
                    siteIds.push(follow.feed.site)
                }
            })

            sails.models.sites.find({ id: siteIds }).exec(function(err, sites) {

                if (err) return res.serverError(err)

                let siteMap = {}

                sites.forEach(site => {
                    siteMap[site.id] = site
                })

                follows.forEach(follow => {
                    if (follow.type == 'feed') {
                        // populate the nested relationship of sites
                        follow.feed.site = siteMap[follow.feed.site]
                    }
                })

                if (type == 'feed') {

                    follows.sort((a, b) => {

                        var a = a.feed.site.siteUrl.toLowerCase(),
                            b = b.feed.site.siteUrl.toLowerCase()

                        if (a < b) return -1
                        if (a > b) return 1

                        return 0

                    })

                }

                return res.ok(follows)

            })

        })

    }
}
