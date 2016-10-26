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
                sails.log.error(err)
                return res.badRequest('Sorry, we could not figure out which url you\'re looking for.')
            } else {

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

                sails.log.info('Adding site', siteUrl, name)

                Sites.findOrCreate({
                    siteUrl: siteUrl
                }, {
                    siteUrl: siteUrl,
                    name: name
                }).exec(function(err, site) {

                    if (err) return res.badRequest('Sorry, failed to add the RSS feed.')

                    Feeds.findOrCreate({
                            feedUrl: feedUrl
                        }, {
                            site: site.id,
                            siteUrl: hostname,
                            feedUrl: feedUrl
                        })
                        .exec(function(err, feed) {

                            if (err) return res.badRequest('Sorry, failed to add the RSS feed.')

                            sails.models.follows.findOrCreate({
                                type: 'feed',
                                feed: feed.id,
                                user: req.user.id
                            }).exec(function(err, follow) {

                                if (err) return res.badRequest('Sorry, failed to add the RSS feed.')

                                // run the scraping in the background
                                ScrapingService.scrapeFeed(feed, 20, function(err, articles) {

                                    if (err) return res.badRequest(`Something went wrong while scraping: ${feed.feedUrl}`)

                                    sails.log.info('Completed scraping for:', feed.feedUrl)

                                    return res.ok({
                                        site_id: site.id,
                                        feed_id: feed.id
                                    })

                                })

                            })

                        })
                })
            }
        })
    },

}
