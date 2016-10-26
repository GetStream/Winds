/**
 * Stream
 *
 * Controller fot the integration with Stream
 */
const request = require('request');

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
                        sails.log.error('Enrichment failed:', err)
                        res.badRequest('Sorry, failed to load the feed.')
                    } else {
                        feedResponse.results = enrichedActivities
                        delete feedResponse.next
                        return res.ok(feedResponse)
                    }
                })

            }).catch(err => {
                sails.log.error('Failed to read the feed from Stream', err)
                res.badRequest('Sorry, failed to load the feed.')
            })

    },

    personalized: function(req, res, next) {

        const userId = req.user.id,
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

            if (error) {
                sails.log.error('Failed to load personalized feed:', error)
                return res.serverError('Failed to load personalized feed.')
            }

            StreamService.enrichActivities(userId, feedResponse.results, function(err, enrichedActivities){
                if (err) {
                    sails.log.error('Enrichment failed:', err)
                    res.badRequest('Sorry, failed to load the feed.')
                } else {
                    feedResponse.results = enrichedActivities
                    delete feedResponse.next
                    return res.ok(feedResponse)
                }
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

            StreamService.enrichActivities(userId, feedResponse.results, function(err, enrichedActivities){
                if (err) {
                    sails.log.error('Enrichment failed:', err)
                    res.badRequest('Sorry, failed to load the feed.')
                } else {
                    feedResponse.results = enrichedActivities
                    delete feedResponse.next
                    return res.ok(feedResponse)
                }
            })

        }).catch(err => {
            sails.log.error('Failed to read the feed from Stream', err)
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
                sails.log.error('Failed to load interest profile :', error)
                return res.serverError('Failed to load interest profile...')
            } else {
                return res.ok(body)
            }

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
                sails.log.error('Failed to load event counts :', error)
                return res.serverError('Failed to load event counts...')
            } else {
                return res.ok(body)
            }

        })
    }

}
