/**
 * Stream
 *
 * Controller fot the integration with Stream
 */
const request = require('request')

module.exports = {

    chronological: function(req, res, next) {

        let userId = req.user.id,
            id_lt = req.param('id_lt'),
            limit = req.param('limit') || 20

        const params = {
            'limit': limit,
        }

        if (id_lt) params.id_lt = id_lt

        StreamService.client.feed('timeline', userId).get(params)
            .then(function(feedResponse) {

                StreamService.enrichActivities(userId, feedResponse.results, function(err, enrichedActivities){

                    if (err) {
                        if (!_.isEmpty(sails.sentry)) {
                            sails.sentry.captureMessage(err)
                        } else {
                            sails.log.warn(err)
                        }
                        return res.badRequest('Sorry, failed to load the feed.')
                    }

                    feedResponse.results = enrichedActivities
                    delete feedResponse.next
                    return res.ok(feedResponse)

                })

            }).catch(err => {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(err)
                } else {
                    sails.log.warn(err)
                }
                return res.badRequest('Sorry, failed to load the feed.')
            })

    },

    personalized: function(req, res, next) {

        const userId   = req.user.id,
              url      = `https://reader.getstream.io/reader/personalized/${userId}`,
              token    = StreamService.getJwtToken(userId),
              offset   = req.param('offset'),
              version  = req.param('version'),
              limit    = req.param('limit') || 25

        request({
            url: url,
            qs: {
                api_key: sails.config.stream.streamApiKey,
                offset: offset,
                limit: limit,
                version: version
            },
            method: 'GET',
            json: true,
            timeout: 10000,
            headers: {
                'authorization': token,
                'stream-auth-type': 'jwt'
            }
        }, function(error, response, feedResponse) {

            if (error || (feedResponse && !feedResponse.results)) {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(error)
                } else {
                    sails.log.warn(error)
                }
                return res.serverError('Failed to load personalized feed.')
            }

            StreamService.enrichActivities(userId, feedResponse.results, function(err, enrichedActivities){

                if (err) {
                    if (!_.isEmpty(sails.sentry)) {
                        sails.sentry.captureMessage(err)
                    } else {
                        sails.log.warn(err)
                    }
                    return res.badRequest('Sorry, failed to load the feed.')
                }

                feedResponse.results = enrichedActivities
                delete feedResponse.next

                return res.ok(feedResponse)

            })

        })

    },

    readFeed: function(req, res, next) {

        let userId = req.user.id,
            feedId = req.param('feed'),
            id_lt  = req.param('id_lt'),
            limit  = req.param('limit') || 20

        const params = {
            'limit': limit,
        }

        if (id_lt) params.id_lt = id_lt

        StreamService.client.feed('rss_feed', feedId).get(params)
        .then(function(feedResponse) {

            StreamService.enrichActivities(userId, feedResponse.results, function(err, enrichedActivities) {

                if (err) {
                    if (!_.isEmpty(sails.sentry)) {
                        sails.sentry.captureMessage(err)
                    } else {
                        sails.log.warn(err)
                    }
                    res.badRequest('Sorry, failed to load the feed.')
                }

                feedResponse.results = enrichedActivities
                delete feedResponse.next

                return res.ok(feedResponse)

            })

        }).catch(err => {
            if (!_.isEmpty(sails.sentry)) {
                sails.sentry.captureMessage(err)
            } else {
                sails.log.warn(err)
            }
            res.badRequest('Sorry, failed to load the feed.')
        })

    },

    interestProfile: function(req, res, next) {

        const userId = req.user.id,
              url    = `https://reader.getstream.io/reader/profile/${userId}/`,
              token  = StreamService.getJwtToken(userId)

        request({
            url: url,
            qs: {
                api_key: sails.config.stream.streamApiKey
            },
            method: 'GET',
            json: true,
            timeout: 10000,
            headers: {
                'authorization': token,
                'stream-auth-type': 'jwt'
            }
        }, function(error, response, body) {
            if (error) {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(error)
                } else {
                    sails.log.warn(error)
                }
                return res.serverError('Failed to load interest profile.')
            }

            return res.ok(body)

        })

    },

    eventCounts: function(req, res, next) {

        const userId = req.user.id,
              url    = `https://reader.getstream.io/reader/engagement/${userId}/`,
              token  = StreamService.getJwtToken(userId)

        request({
            url: url,
            qs: {
                api_key: sails.config.stream.streamApiKey
            },
            method: 'GET',
            json: true,
            timeout: 10000,
            headers: {
                'authorization': token,
                'stream-auth-type': 'jwt'
            }
        }, function(error, response, body) {

            if (error) {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(error)
                } else {
                    sails.log.warn(error)
                }
                return res.serverError('Failed to load event counts.')
            }

            return res.ok(body)

        })

    },

    getfeedSuggestions: function(req, res, next) {

        const userId = req.user.id,
              url    = `https://reader.getstream.io/reader/recommended/${userId}`,
              token  = StreamService.getJwtToken(userId)

        request({
            url: url,
            qs: {
                api_key: sails.config.stream.streamApiKey
            },
            method: 'GET',
            json: true,
            timeout: 10000,
            headers: {
                'authorization': token,
                'stream-auth-type': 'jwt'
            }
        }, function(error, response, body) {

            if (error) {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(error)
                } else {
                    sails.log.warn(error)
                }
                return res.serverError('Failed to load suggested feeds.')
            }

            let results = body.results,
                length  = results.length,
                feeds   = []

            results.forEach((feed) => {

                sails.models.feeds.findOne({ id: feed })
                    .then((feed) => {

                        sails.models.sites.findOne({ id: feed.site })
                            .then((site) => {

                                feed.site = site
                                feeds.push(feed)

                                if (!--length) {
                                    res.json(feeds)
                                }

                            })

                    })

            })

        })

    },

    updateFeedSuggestions: function(req, res, next) {

        const userId = req.user.id,
              url    = `https://reader.getstream.io/reader/recommended/${userId}/`,
              token  = StreamService.getJwtToken(userId)

        let payload = {
            feed_id: req.body.feed_id,
        }

        if (req.query.follow) {
            payload.accepted_at = true
        } else {
            payload.accepted_at = false
        }

        request({
            url: url,
            qs: {
                api_key: sails.config.stream.streamApiKey
            },
            method: 'POST',
            body: payload,
            json: true,
            timeout: 10000,
            headers: {
                'authorization': token,
                'stream-auth-type': 'jwt'
            }
        }, function(error, response, body) {

            if (error) {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(error)
                } else {
                    sails.log.warn(error)
                }
                return res.serverError('Failed to load suggested feeds.')
            }

            if (req.query.follow) {

                sails.models.follows.create({
                    user: userId,
                    feed: req.body.feed_id,
                    type: 'feed' }).exec(function(err, response) {

                        if (error) {
                            if (!_.isEmpty(sails.sentry)) {
                                sails.sentry.captureMessage(error)
                            } else {
                                sails.log.warn(error)
                            }
                            return res.serverError('Failed to make follow relationship.')
                        }

                        res.send(204)

                    })

            } else {
                res.send(204)
            }

        })

    },

}
