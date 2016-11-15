/**
 * UploadsController
 *
 * @description :: Server-side logic for managing uploads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    opml: function(req, res) {

        const fs     = require('fs'),
              urlLibrary = require('url'),
              parser = require('node-opml-parser')

        req.file('opml').upload(function (err, files) {

            if (err) return res.serverError(err)

            let opml = fs.readFileSync(files[0].fd, 'utf8'),
                urls = []

            parser(opml, (err, feeds) => {

                if (err) return res.serverError(err)

                urls = feeds.map(feed => {
                    return feed.feedUrl
                })

                function addFeed(feedUrl, callback) {

                    console.log('inserting', feedUrl)

                    parse.fetch(feedUrl, function(err, rssMeta, articles) {

                        console.log(rssMeta)

                        if (err) {
                            return res.badRequest('Sorry, we could not figure out which url you\'re looking for.')
                        }

                        const hostname = urlLibrary.parse(feedUrl).hostname

                        let rssLinkHostname

                        if (rssMeta.link) rssLinkHostname = urlLibrary.parse(rssMeta.link).hostname

                        let siteUrl = rssLinkHostname || hostname,
                            name    = rssMeta.title

                        if (name && name.indexOf('RSS') != -1) name = null

                        // create the site, and after that create the feed
                        async.waterfall([

                            function(callback) {

                                console.log('site')

                                Sites.findOrCreate({
                                    siteUrl: siteUrl
                                }, {
                                    siteUrl: siteUrl,
                                    name: name
                                }).exec(callback)

                                return console.log(callback)


                            }, function(site, callback) {

                                console.log('site', site)

                                Feeds.findOrCreate({
                                    feedUrl: feedUrl
                                }, {
                                    site: site.id,
                                    siteUrl: hostname,
                                    feedUrl: feedUrl
                                }).exec(callback)

                            }, function(feed, callback) {

                                console.log('follow and sync')

                                async.parallel([

                                    function(callback) {

                                        console.log('follow')

                                        sails.models.follows.findOrCreate({
                                            type: 'feed',
                                            feed: feed.id,
                                            user: req.user.id
                                        })

                                    },

                                    function(callback) {

                                        console.log('sync')

                                        let timelineFeed = StreamService.client.feed('timeline', req.user.id)

                                        timelineFeed.follow('rss_feed', feed.id)
                                            .then(response => {
                                                callback(null, response)
                                            }).catch(err => {
                                                console.log(err)
                                                callback(err)
                                            })

                                    }

                                ], function(err, results) {
                                    console.log('ERR', err)
                                    console.log('RESULTS', results)
                                    callback(err, results)
                                })

                            }
                        ], function(err, results) {
                            console.log('completed for 1 url')
                            callback(err, results)
                        })
                    })
                }

                // TODO: 1 -> 30
                async.mapLimit(urls, 1, addFeed, function(err, results) {
                    console.log('all done ye ye')
                    res.send(200)
                })

            })


        })

    },

}
