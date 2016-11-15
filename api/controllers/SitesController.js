/**
 * SitesController
 *
 * @description :: Server-side logic for managing sites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var URI = require('urijs'),
    urlLibrary = require('url')

module.exports = {

    discover: function(req, res, next) {

        let humanizedUrl = req.param('url')

        if (!humanizedUrl) {
            res.badRequest('Sorry, you need to provide a url query parameter')
        }

        // TODO: use async here to clean up the flow
        DiscoverService.findRSS(humanizedUrl, function(err, url, feedUrl, rssMeta) {

            if (err) {
                return res.badRequest('Sorry, we could not figure out which url you\'re looking for.')
            }

            const hostname = urlLibrary.parse(url).hostname
            let rssLinkHostname

            if(rssMeta.link) {
                rssLinkHostname = urlLibrary.parse(rssMeta.link).hostname
            }

            let siteUrl = rssLinkHostname || hostname,
                name    = rssMeta.title

            if (name && name.indexOf('RSS') != -1) {
                name = null
            }

            Sites.findOrCreate({
                siteUrl: siteUrl
            }, {
                siteUrl: siteUrl,
                name: name
            }).exec(function(err, site) {

                if (err) {
                    return res.badRequest('Sorry, failed to add the RSS feed.')
                }

                Feeds.findOrCreate({
                        feedUrl: feedUrl
                    }, {
                        site: site.id,
                        siteUrl: hostname,
                        feedUrl: feedUrl
                    })
                    .exec(function(err, feed) {

                        if (err) {
                            return res.badRequest('Sorry, failed to add the RSS feed.')
                        }

                        // Insert in the DB, Sync to Stream and scrape at the same time

                        async.parallel(
                            [callback => {
                                // insert the follow into the database
                                sails.models.follows.findOrCreate({
                                    type: 'feed',
                                    feed: feed.id,
                                    user: req.user.id
                                }).exec(callback)
                            },
                            callback => {
                                // sync the data to stream
                                let timelineFeed = StreamService.client.feed('timeline', req.user.id)
                                timelineFeed.follow('rss_feed', feed.id).then(response => {
                                    callback(null, response)
                                }).catch(err => {
                                    callback(err)
                                })
                            },
                            callback => {
                                // scraping fun
                                ScrapingService.scrapeFeed(feed, 10, function(err, articles) {
                                    if (err) {
                                        sails.log.error('Something went wrong while scraping', err)
                                    } else {
                                        sails.log.info('Completed scraping for:', feed.feedUrl)
                                    }
                                    callback(err, articles)
                                })
                            }], function(err, results) {
                                if (err) {
                                    sails.log.error(err)
                                    return res.badRequest('Sorry, failed to add the RSS feed.')
                                } else {
                                    // all good return
                                    return res.ok({
                                        site_id: site.id,
                                        feed_id: feed.id
                                    })
                                }
                            }
                        )
                    })

            })

        })
    },

}
