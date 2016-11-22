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

        sails.log.verbose(`starting discovery for url: ${humanizedUrl}`)

        async.waterfall([
            callback => {
                // see if there's an RSS feed on this page
                DiscoverService.findRSS(humanizedUrl, function(err, url, feedUrl, rssMeta) {

                    if (err) {
                        sails.log.warn('discover failed', err)
                        return callback(err)
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
                    sails.log.verbose(`discovered feedurl ${feedUrl}, ${siteUrl}, ${name}`)
                    return callback(err, feedUrl, siteUrl, name, rssMeta)
                })
            },
            function(feedUrl, siteUrl, name, rssMeta, callback) {
                // insert the site
                Sites.findOrCreate({
                    siteUrl: siteUrl
                }, {
                    siteUrl: siteUrl,
                    name: name
                }).exec(function(err, site) {
                    sails.log.verbose('succesfuly created sited', site)
                    callback(err, site, feedUrl)
                })
            },
            function(site, feedUrl, callback) {
                Feeds.findOrCreate({
                        feedUrl: feedUrl
                    }, {
                        site: site.id,
                        siteUrl: site.siteUrl,
                        feedUrl: feedUrl
                    }).exec(function(err, feed) {
                        sails.log.verbose('succesfuly created feed', feed)
                        callback(err, site, feed)
                    })
            },
            function(site, feed, callback) {
                // Insert in the DB, Sync to Stream and scrape at the same time
                sails.log.verbose('inserting follow relationship, sync to stream and start scraping')

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
                        ScrapingService.scrapeFeed(feed, 10, false, function(err, articles) {
                            if (err) {
                                sails.log.error('Something went wrong while scraping', err)
                            } else {
                                sails.log.info('Completed scraping for:', feed.feedUrl)
                            }
                            callback(err, articles)
                        })
                    }], function(err, results) {
                        callback(err, site, feed)
                    }
                )
            }
        ], function(err, site, feed) {
            if (err) {
                sails.log.error('Failed to add the RSS feed', err)
                sails.models.failures.findOrCreate({user: req.user.id, url: humanizedUrl}).exec(function(err, results) {
                    return res.badRequest('Sorry, failed to add the RSS feed.')
                })
            } else {
                sails.log.verbose('succesfully completed discovery site, feed', site.id, feed.id)
                // all good return
                return res.ok({
                    site_id: site.id,
                    feed_id: feed.id
                })
            }
        })
    },

}
